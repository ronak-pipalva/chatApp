import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import passport from "passport";
import Models from "../models/index.js";
import dbServices from "../utils/db_services.js";
import authConstant from "../constants/auth_const.js";

export const authenticateUser = () => {
  const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: authConstant.JWT.ADMIN_SECRET,
  };

  passport.use(
    "user_auth",
    new JwtStrategy(options, async (payload, done) => {
      try {
        const user = await dbServices.findOne(Models.user, {
          _id: payload.sub,
        });
        return user ? done(null, user.toJSON()) : done(null, false);
      } catch (error) {
        done(error, false);
      }
    })
  );
};
