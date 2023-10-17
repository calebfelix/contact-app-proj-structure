const jsonwebtoken = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes")
require('dotenv').config();
function checkJwtHS256(settingsConfig, req, res, next) {
  try {
    const logger = settingsConfig.logger;
    logger.info(`[AUTH_SERVICE] : Inside checkJWTHS256`);
    const secretKey = process.env.JWT_SECRET_KEY;

    let token = req?.headers["auth"];
    if (token==undefined) {
      token = req.cookies[process.env.AUTH_COOKIE_NAME]
    }
    
    return jsonwebtoken.verify(token, secretKey)
  } catch (error) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized - Invalid token" });
  }
}
function verifyTokenAndUsername(settingsConfig, req, res, next) {
  try {
    const logger = settingsConfig.logger;
    logger.info(`[AUTH_SERVICE] : Inside checkJWTHS256`);
    const secretKey = process.env.JWT_SECRET_KEY;

    let token = req?.headers["auth"];
    if (token==undefined) {
      token = req.cookies[process.env.AUTH_COOKIE_NAME]
    }
    
    return jsonwebtoken.verify(token, secretKey)
  } catch (error) {
    throw error
  }
}

const isAdmin = (settingsConfig, req, res, next) => {
  try {
    const payload = checkJwtHS256(settingsConfig, req, res, next)
    if (!payload.isAdmin) {
      throw new Error("Not an Admin")
    }
    next()
  } catch (error) {
    return res.status(StatusCodes.UNAUTHORIZED).json(error.message);
  }
}

const isCurrentUser = (settingsConfig, req, res, next)=> {
  try {
      const payload = checkJwtHS256(settingsConfig, req, res, next)
      if(payload.userId != req.params.userId){
        throw new Error("User does not access");
      }
      // console.log(payload)
      // console.log(req.params)
      // next();
      return payload
  } catch (error) {
    return res.status(StatusCodes.UNAUTHORIZED).json(error.message);
  }
}

const isUser = (settingsConfig, req, res, next) => {
  try {
    const payload = checkJwtHS256(settingsConfig, req, res, next)
    if (payload.isAdmin) {
      throw new Error("Not an User")
    }
    next()
  } catch (error) {
    return res.status(StatusCodes.UNAUTHORIZED).json(error.message);
  }
}

const authenticate = (userId, username, isAdmin)=> {
  try {
    let payload = new Jwtauthentication(userId, username, isAdmin);
    let myobj = {
      userId: payload.userId,
      username: payload.username,
      isAdmin: payload.isAdmin,
    };
    let token = jwt.sign(myobj, Jwtauthentication.secretKey, {
      expiresIn: 60 * 60,
    });

    return token;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  checkJwtHS256,
  isAdmin,
  isUser,
  isCurrentUser,
  authenticate,
  verifyTokenAndUsername
};
