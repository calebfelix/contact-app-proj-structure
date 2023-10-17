const { StatusCodes } = require("http-status-codes");
const UserService = require("../service/UserService");
const {
  checkJwtHS256,
  verifyTokenAndUsername,
} = require("../../../middleware/authService");
const { Unauthorized } = require("throw.js");
const { result } = require("lodash");

class UserController {
  constructor() {
    this.userService = new UserService();
  }

  async login(settingsConfig, req, res, next) {
    try {
      const logger = settingsConfig.logger;
      logger.info(`[UserController] : Inside login`);

      const { username, password } = req.body;
      const [token, user] = await this.userService.authenticateUser(
        settingsConfig,
        username,
        password
      );
      res.set(process.env.AUTH_COOKIE_NAME, token);
      res.cookie(process.env.AUTH_COOKIE_NAME, token);

      res.status(StatusCodes.OK).json(user);
    } catch (error) {
      next(error);
    }
  }

  async logout(settingsConfig, req, res, next) {
    try {
      const logger = settingsConfig.logger;
      logger.info(`[UserController] : Inside logout`);

      res.cookie(process.env.AUTH_COOKIE_NAME, "", {
        expires: new Date(Date.now()),
      });
      res.status(StatusCodes.OK).json("Logged out");
    } catch (error) {
      next(error);
    }
  }

  async createUser(settingsConfig, req, res, next) {
    try {
      const logger = settingsConfig.logger;
      logger.info(`[UserController] : Inside createUser`);

      const user = await this.userService.getUserByUsername(
        settingsConfig,
        req.body.username
      );
      if (user.length != 0) {
        throw new Error("username Already Taken");
      }
      const newUser = await this.userService.createUser(
        settingsConfig,
        req.body
      );

      res.status(StatusCodes.CREATED).json(newUser);
      return;
    } catch (error) {
      next(error);
    }
  }

  async getAllUsers(settingsConfig, req, res, next) {
    try {
      const logger = settingsConfig.logger;
      logger.info(`[UserController] : Inside getAllUsers`);

      const queryParams = req.query;
      const { count, rows } = await this.userService.getAllUsers(
        settingsConfig,
        queryParams
      );
      res.set("X-Total-Count", count);
      res.status(StatusCodes.OK).json(rows);
      return;
    } catch (error) {
      next(error);
    }
  }

  async getUserById(settingsConfig, req, res, next) {
    try {
      const logger = settingsConfig.logger;
      logger.info(`[UserController] : Inside getUserById`);

      const { userId } = req.params;
      const user = await this.userService.getUserById(
        settingsConfig,
        userId,
        req.query
      );
      res.status(StatusCodes.OK).json(user);
      return;
    } catch (error) {
      next(error);
    }
  }

  async updateUser(settingsConfig, req, res, next) {
    try {
      const logger = settingsConfig.logger;
      logger.info(`[UserController] : Inside updateUser`);

      const { userId } = req.params;
      const user = await this.userService.getUserById(
        settingsConfig,
        userId,
        req.query
      );
      if (user.length == 0) {
        throw new Error("User Not Found!");
      }

      const [userUpdated] = await this.userService.updateUser(
        settingsConfig,
        userId,
        req.body
      );
      if (userUpdated == 0) {
        throw new Error("Could Not Update user");
      }
      res.status(StatusCodes.OK).json("userUpdated");
      return;
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(settingsConfig, req, res, next) {
    try {
      const logger = settingsConfig.logger;
      logger.info(`[UserController] : Inside deleteUser`);

      const { userId } = req.params;
      const user = await this.userService.getUserById(
        settingsConfig,
        userId,
        req.query
      );
      if (user.length == 0) {
        throw new Error("User Not Found!");
      }

      const userDeleted = await this.userService.deleteUser(
        settingsConfig,
        userId
      );
      if (userDeleted == 0) {
        throw new Error("Could Not Delete user");
      }
      res.status(StatusCodes.OK).json("user Deleted");
      return;
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(settingsConfig, req, res, next) {
    try {
      const logger = settingsConfig.logger;
      logger.info(`[UserController] : Inside resetPassword`);

      let { currentPassword, newPassword, username } = req.body;
      let [token, user] = await this.userService.authenticateUser(
        settingsConfig,
        username,
        currentPassword
      );
      let [updated] = await this.userService.resetPassword(
        settingsConfig,
        user.id,
        newPassword
      );
      if (updated == 0) {
        throw new Error("Could Not reset password");
      }
      res.status(StatusCodes.OK).json("updated password");
    } catch (error) {
      next(error);
    }
  }

  async verify(settingsConfig, req, res, next) {
    try {
      const logger = settingsConfig.logger;
      logger.info(`[UserController] : Inside verify`);
      if (!req.body.username) {
        throw new Unauthorized("No username");
      }
      const payload = verifyTokenAndUsername(settingsConfig, req, res, next);
      if (!payload) {
        throw new Unauthorized("Payload invlaid");
      }
      const result = this.userService.verifyUserByUserName(
        settingsConfig,
        payload,
        req.body.username
      );
      console.log(payload);
      res.status(StatusCodes.OK).json({ result, payload });
      return;
    } catch (error) {
      res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ result: false, payload: null });
    }
  }
}

module.exports = new UserController();
