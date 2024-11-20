/**
 * responseHandler.js
 * @description :: exports all handlers for response format.
 */
import responseHelper from "./index.js";
import responseCode from "./response_code.js";

/**
 *
 * @param {Request} req : request from controller.
 * @param {Response} res : response from controller.
 * @param {NextFunction} next : executes the middleware succeeding the current middleware.
 */
const responseHandler = (req, res, next) => {
  res.success = (data = {}) => {
    res.status(responseCode.success).json(responseHelper.success(data));
  };

  res.failure = (data = {}) => {
    res.status(responseCode.success).json(responseHelper.failure(data));
  };

  res.internalServerError = (data = {}) => {
    res
      .status(responseCode.internalServerError)
      .json(responseHelper.internalServerError(data));
  };

  res.badRequest = (data = {}) => {
    res.status(responseCode.badRequest).json(responseHelper.badRequest(data));
  };

  res.recordNotFound = (data = {}) => {
    res.status(responseCode.success).json(responseHelper.recordNotFound(data));
  };

  res.validationError = (data = {}) => {
    res
      .status(responseCode.validationError)
      .json(responseHelper.validationError(data));
  };

  res.unAuthorized = (data = {}) => {
    res
      .status(responseCode.unAuthorized)
      .json(responseHelper.unAuthorized(data));
  };

  res.emptySuccess = (data = []) => {
    res
      .status(responseCode.emptySuccess)
      .json(responseHelper.emptySuccess(data));
  };

  next();
};

export default responseHandler;
