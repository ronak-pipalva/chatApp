import Models from "../models/index.js";
import moment from "moment";
import jwt from "jsonwebtoken";
import db_services from "../utils/db_services.js";
import authConstant from "../constants/auth_const.js";
import ApiError from "../utils/api_error.js";
import { response_objects } from "../utils/response/response_message.js";

export const saveToken = async (token, user, expires, type) => {
  try {
    let user_id = user.id;
    let body = {
      token: token,
      token_type: type,
      user_id: user_id,
      token_expired_time: expires ? expires.toDate() : new Date(),
    };

    const create_token = await db_services.createOne(Models.user_token, body);

    return create_token;
  } catch (error) {
    console.log(error);

    throw new ApiError(500, response_objects[0].message);
  }
};

export const generateToken = (user_details, expires, secret) => {
  try {
    const user_id = user_details.id;
    const user_email = user_details.email;
    const user_type = user_details.user_type;

    const payload = {
      sub: user_id,
      email: user_email,
      user_type: user_type,
      iat: moment().unix(),
    };

    if (expires) {
      payload["exp"] = expires.unix();
    }

    return jwt.sign(payload, secret);
  } catch (error) {
    console.log(error);

    throw new ApiError(500, response_objects[0].message);
  }
};

export const generateAuthTokens = async (user) => {
  try {
    const access_token_expires = moment().add(
      authConstant.JWT.ACCESS_EXPIRES_IN,
      "minutes"
    );

    const access_token = generateToken(
      user,
      access_token_expires,
      authConstant.JWT.ADMIN_SECRET
    );

    const refresh_token_expires = moment().add(
      authConstant.JWT.REFRESH_EXPIRES_IN,
      "days"
    );
    const refresh_token = generateToken(
      user,
      refresh_token_expires,
      authConstant.JWT.ADMIN_SECRET
    );

    await saveToken(
      refresh_token,
      user,
      refresh_token_expires,
      authConstant.TOKEN_TYPES.REFRESH
    );

    return {
      access_token: access_token,
      refresh_token: refresh_token,
    };
  } catch (error) {
    throw new ApiError(500, response_objects[0].message);
  }
};

export const readToken = async (token, token_type) => {
  try {
    let decoded_token = jwt.decode(token);

    let query = {
      token: token,
      token_type: token_type,
    };

    let get_token = await db_services.findOne(Models.user_token, query);

    if (!get_token || get_token === null) {
      return {
        data: null,
        type: "NOT_FOUND",
        message_type: "message",
        module_name: "Token",
      };
    }
    return {
      data: decoded_token,
      type: "",
      message_type: "",
    };
  } catch (error) {
    throw new ApiError(500, response_objects[0].message);
  }
};

export const refreshAuth = async (refresh_token) => {
  try {
    let token = await readToken(
      refresh_token,
      authConstant.TOKEN_TYPES.REFRESH
    );
    console.log(token);

    if (token.data === null) {
      return {
        data: null,
        type: token.type,
        message_type: token.message_type,
        module_name: token.module_name,
      };
    }

    let user_id = token.data.sub;

    const find_user = await dbServices.findOne(Models.user, {
      id: user_id,
    });
    if (!find_user) {
      return {
        data: null,
        type: "NOT_FOUND",
        message_type: "message",
        module_name: "User",
      };
    }

    token = await generateAuthTokens(find_user);

    return {
      data: token,
      type: "",
      message_type: "",
    };
  } catch (error) {
    console.log(error);
    throw new ApiError(500, response_objects[0].message);
  }
};
