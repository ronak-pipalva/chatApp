class ApiError extends Error {
  constructor(
    statusCode,
    message,
    isOperational = true,
    data = null,
    stack = ""
  ) {
    super(message);
    this.message = message;
    this.statusCode = statusCode;
    this.data = data;
    this.isOperational = isOperational;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default ApiError;
