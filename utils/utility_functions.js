import jwt from "jsonwebtoken";
import ApiError from "./api_error.js";
import db_services from "./db_services.js";
import { response_objects } from "./response/response_message.js";
import auth_const from "../constants/auth_const.js";
import Models from "../models/index.js";

const createDynamicMessage = async (module_name, message, message_type) => {
  switch (message_type) {
    case "IMAGE_NOT_FOUND":
      return `${message} ${module_name}`;
    case "REGISTRATION_SUCCESS":
      return `${module_name} ${message}`;
    case "CREATE_SUCCESS":
      return `${module_name} ${message}`;
    case "UPDATE_SUCCESS":
      return `${module_name} ${message}`;
    case "GET_DETAILS":
      return `${module_name} ${message}`;
    case "NOT_FOUND":
      return `${module_name} ${message}`;
    case "TOO_SOON":
      return `${module_name} ${message}`;
    default:
      return `${module_name} ${message}`;
  }
};

const sendError = async (data, next) => {
  try {
    let message;
    let statusCode;
    let { type, module_name, message_type, data: inner_data } = data;

    const errorObj = response_objects.find((err) => err.type === type);

    if (!errorObj) {
      message = response_objects[0].message;
      statusCode = response_objects[0].statusCode;
    } else if (data.type === "VALIDATION_ERROR") {
      message = data.message_type;
      statusCode = errorObj.statusCode;
    } else {
      message = errorObj.message;
      statusCode = errorObj.statusCode;

      if (module_name) {
        const dynamicMsg = await createDynamicMessage(
          module_name,
          message,
          type
        );
        message = dynamicMsg;
      }
    }
    throw new ApiError(statusCode, message, true, inner_data);
  } catch (error) {
    console.log(error);

    return next(error);
  }
};

const sendSuccess = async (res, responseData, next) => {
  try {
    let message;
    let statusCode;
    let { type, message_type, module_name, data } = responseData;
    const responseObj = response_objects.find((err) => err.type === type);

    message = responseObj[message_type] || responseObj["message"];
    statusCode = responseObj.statusCode;

    if (module_name) {
      const dynamicMsg = await createDynamicMessage(module_name, message, type);
      message = dynamicMsg;
    }

    return res.status(statusCode).json({
      status: "success",
      statusCode: statusCode,
      message: message,
      data: data,
    });
  } catch (error) {
    return next(error);
  }
};

const checkUniqueFieldsInDatabase = async (
  model,
  fieldsToCheck,
  data,
  filter = {}
) => {
  for (const field of fieldsToCheck) {
    const query = {
      ...filter,
      [field]: data[field],
    };
    const found = await db_services.findOne(model, query);
    if (found) {
      return {
        isDuplicate: true,
        field,
        value: data[field],
      };
    }
  }
  return { isDuplicate: false };
};

const getUserDetailsFromToken = async (token) => {
  try {
    const decoded_token = jwt.verify(token, auth_const.JWT.ADMIN_SECRET);

    if (!decoded_token.sub) {
      throw new ApiError(400, "Token does not contain valid user information");
    }

    let where = {
      _id: decoded_token.sub,
    };
    const user = await Models.user.findOne(where);

    if (!user) {
      throw new ApiError(404, "User not found");
    }
    return user;
  } catch (error) {
    throw new ApiError(500, error.message || response_objects[0].message);
  }
};

const getConversation = async (user_id) => {
  const currentUserConversation = await Models.conversation
    .find({
      $or: [{ sender: user_id }, { receiver: user_id }],
    })
    .sort({ updated_at: -1 })
    .populate("sender")
    .populate("messages");

  const conversation = currentUserConversation.map((item) => {
    const unseenMsg = item.messages.reduce(
      (prev, curr) => prev + (curr.seen ? 0 : 1),
      0
    );
    return {
      _id: item?.id,
      sender: item.sender,
      receiver: item.receiver,
      unseenMsg,
      lastMessage: item.messages[item.messages?.length - 1],
    };
  });

  return conversation;
};
export {
  sendError,
  sendSuccess,
  checkUniqueFieldsInDatabase,
  getUserDetailsFromToken,
  getConversation,
};
