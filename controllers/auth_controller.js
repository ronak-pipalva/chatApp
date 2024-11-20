import { checkUniqueFieldsInDatabase } from "../utils/utility_functions.js";
import Models from "../models/index.js";
import auth_service from "../services/auth_service.js";

const register = async (req, res, next) => {
  let data_to_create = req.body;

  const checkUniqueFields = await checkUniqueFieldsInDatabase(
    Models.user,
    ["email"],
    data_to_create
  );

  if (checkUniqueFields.isDuplicate) {
    return Promise.reject({
      type: "VALIDATION_ERROR",
      message_type: `${checkUniqueFields.value} already exists.Unique ${checkUniqueFields.field} are allowed.`,
    });
  }

  const result = await auth_service.createUser(data_to_create);

  return {
    data: result.data,
    message_type: result.message_type,
    type: result.type,
  };
};

const login = async (req, res, next) => {
  const login_data = req.body;

  const result = await auth_service.loginUser(login_data);

  if (result.data == null) {
    return Promise.reject({
      data: result.data,
      message_type: result.message_type,
      module_name: result.module_name,
      type: result.type,
    });
  }

  return {
    data: result.data,
    message_type: result.message_type,
    module_name: result.module_name,
    type: result.type,
  };
};
const verifyEmail = async (req, next) => {
  const data = req.body;

  const result = await auth_service.verifyEmailInDb(data);

  if (result.data == null) {
    return Promise.reject({
      data: result.data,
      message_type: result.message_type,
      module_name: result.module_name,
      type: result.type,
    });
  }

  return {
    data: result.data,
    message_type: result.message_type,
    module_name: result.module_name,
    type: result.type,
  };
};

const resendOtp = async (req, next) => {
  const email = req.body.email;

  const result = await auth_service.sendEmailOtp(email);

  if (result.data == null) {
    return Promise.reject({
      data: result.data,
      message_type: result.message_type,
      module_name: result.module_name,
      type: result.type,
    });
  }

  return {
    data: result.data,
    message_type: result.message_type,
    module_name: result.module_name,
    type: result.type,
  };
};
export { register, login, verifyEmail, resendOtp };
