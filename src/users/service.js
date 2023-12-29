const { User } = require("./schema/User");

class UserService {
  async getUsers(params) {
    if (params?.range) {
      const parsedJson = JSON.parse(params.range);
      if (!parsedJson[1]) return;

      const users = await User.find()
        .sort({ createdAt: 1 })
        .skip(parsedJson[0])
        .limit(parsedJson[1]);
      return users;
    }

    const users = await User.find();
    return users;
  }

  async getUserByEmail(email) {
    try {
      const user = await User.findOne({ email: email });
      if (user == null) {
        const mongoError = {
          mongoError: { errorMessage: "User Not Found", status: 404 },
        };
        return mongoError;
      }
      delete user?.password;
      return user;
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

  async createUser(userToCreate) {
    try {
      userToCreate.password = await cryptoPassword(userToCreate.password);
      const userCreate = await User.create({
        ...userToCreate,
      });
      return { userCreated: true, email: userCreate.email };
    } catch (error) {
      const mongoError = {
        mongoError: { ...error },
      };

      if (error.code == "11000") {
        mongoError.mongoError.errorMessage = "Email is already in use!";
      }

      return mongoError;
    }
  }

  async updateUser(emailToUpdate, userToUpdate) {
    try {
      if (userToUpdate.password)
        userToUpdate.password = await cryptoPassword(userToUpdate.password);

      delete userToUpdate.email;

      const userUpdate = await User.findOneAndUpdate(
        { email: emailToUpdate },
        userToUpdate
      );
      if (userUpdate == null) {
        const mongoError = {
          mongoError: { errorMessage: "User Not Found", status: 404 },
        };
        return mongoError;
      }
      delete userUpdate._doc._id;
      return userUpdate._doc;
    } catch (error) {
      const mongoError = {
        mongoError: { ...error },
      };
      return mongoError;
    }
  }

  async deleteUser(email) {
    try {
      const userDeleted = await User.findOneAndDelete({ email: email });
      if (userDeleted == null) {
        const mongoError = {
          mongoError: { errorMessage: "User Not Found", status: 404 },
        };
        return mongoError;
      }
      return userDeleted;
    } catch (error) {
      const mongoError = {
        mongoError: { ...error },
      };
      return mongoError;
    }
  }
}

module.exports = UserService;