const { Router } = require("express");
const AuthService = require("./service");

const authRouter = Router();
const authService = new AuthService();

class AuthService {
  async authUser(email, password) {
    try {
      const user = await User.findOne({ email: email });

      if (user == null) {
        const mongoError = {
          mongoError: { errorMessage: "User Not Found", status: 404 },
        };
        return mongoError;
      }

      const checkPassword = await comparePassword(password, user.password);
      return checkPassword;
    } catch (error) {
      const mongoError = {
        mongoError: {
          ...error,
          errorMessage: "Bad Request Check Your Parameter",
          status: 400,
        },
      };
      return mongoError;
    }
  }
}

module.exports = AuthService;