const JWT = {
  ADMIN_SECRET: "voultupbeisgood",
  ACCESS_EXPIRES_IN: 60,
  REFRESH_EXPIRES_IN: 365,
};

const TOKEN_TYPES = {
  ACCESS: "access_token",
  REFRESH: "refresh_token",
  FORGOT_PASSWORD: "forgot_password",
};

export default { JWT, TOKEN_TYPES };
