import passport from "passport";

const Authenticate = async (req, res, next) => {
  passport.authenticate(
    "user_auth",
    { session: false },
    async (err, user, info) => {
      if (err || info || !user) {
        console.log("Unauthorized access:", info || err);
        return res.status(401).json({ data: null, message: "Unauthorized" });
      }

      req.user = user; // Attach the user to the request
      next();
    }
  )(req, res, next);
};

export default Authenticate;
