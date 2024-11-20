import moment from "moment";
import Models from "../models/index.js";
import db_services from "../utils/db_services.js";
import { response_objects } from "../utils/response/response_message.js";
import sendMail from "./email_service.js";
import { generateAuthTokens } from "./token_service.js";

const createUser = async (data_to_create) => {
  try {
    let otp = "1111";
    let expire_time = moment.utc().add(10, "minutes").toDate();

    data_to_create.login_otp = { otp, expire_time };

    const user = await db_services.createOne(Models.user, data_to_create);

    await sendEmailOtp(data_to_create, otp);

    return {
      type: "REGISTRATION_SUCCESS",
      message_type: "message",
      data: user,
    };
  } catch (error) {
    throw new ApiError(500, response_objects[0].message);
  }
};

const loginUser = async (login_data) => {
  try {
    let query = {
      email: login_data.email,
    };

    const user = await db_services.findOne(Models.user, query);

    if (!user) {
      return {
        type: "NOT_FOUND",
        message_type: "",
        module_name: "User",
        data: null,
      };
    }

    if (!user.is_email_verified) {
      return {
        type: "EMAIL_NOT_VERIFIED",
        message_type: "",
        data: null,
      };
    }

    let is_password_correct = await user.isPasswordCorrect(login_data.password);

    if (!is_password_correct) {
      return {
        type: "INCORRECT_CREDENTIALS",
        message_type: "",
        data: null,
      };
    }

    const tokens = await generateAuthTokens(user);

    return {
      type: "LOGIN_SUCCESS",
      message_type: "",
      data: { ...user.toJSON(), tokens },
    };
  } catch (error) {
    throw new ApiError(500, response_objects[0].message);
  }
};
const verifyEmailInDb = async (data) => {
  try {
    let query = {
      email: data.email,
    };
    const user = await db_services.findOne(Models.user, query);

    if (!user) {
      return {
        type: "NOT_FOUND",
        message_type: "",
        module_name: "User",
        data: null,
      };
    }

    if (data.otp !== user.login_otp.otp) {
      return {
        type: "INVALID_OTP",
        message_type: "",
        data: null,
      };
    }

    if (moment().isAfter(moment(user.login_otp.expire_time))) {
      return {
        type: "OTP_EXPIRED",
        message_type: "",
        data: null,
      };
    }

    const update_user = await db_services.update(Models.user, query, {
      is_email_verified: true,
    });

    return {
      type: "EMAIL_VERIFIED",
      message_type: "",
      data: update_user[0],
    };
  } catch (error) {
    throw new ApiError(500, response_objects[0].message);
  }
};

const resendEmailOtp = async (email) => {
  try {
    let query = {
      email: email,
    };
    console.log("query", query);

    const user = await db_services.findOne(Models.user, query);

    if (!user) {
      return {
        type: "NOT_FOUND",
        message_type: "",
        module_name: "User",
        data: null,
      };
    }

    let otp = "2222";
    let expire_time = moment.utc().add(10, "minutes").toDate();

    user.login_otp = {
      otp,
      expire_time,
    };

    console.log("user ::", user);

    await user.save();

    sendEmailOtp(user, otp);

    return {
      type: "OTP_SEND",
      message_type: "",
      data: null,
    };
  } catch (error) {
    console.log("error ::", error);

    throw new ApiError(500, error.message || response_objects[0].message);
  }
};

const sendEmailOtp = async (user, otp) => {
  try {
    let mail_obj = {
      subject: "Email OTP!",
      template: "/views/send_otp",
      to: user.email,
      data: { name: user.name, otp: otp },
    };

    try {
      await sendMail(mail_obj);

      return true;
    } catch (error) {
      console.log(error);

      return false;
    }
  } catch (error) {
    console.log(error);

    return false;
  }
};

const forgotPasswordEmail = async (token, user) => {
  try {
    let url = `http://localhost:3000/token=${token}`;
    let mail_obj = {
      subject: "Email OTP!",
      template: "/views/forgot_password",
      to: user.email,
      data: { url: url, name: user.name },
    };

    try {
      await sendMail(mail_obj);

      return true;
    } catch (error) {
      console.log(error);

      return false;
    }
  } catch (error) {
    console.log(error);

    return false;
  }
};
export default {
  createUser,
  loginUser,
  verifyEmailInDb,
  resendEmailOtp,
  sendEmailOtp,
  forgotPasswordEmail,
};
