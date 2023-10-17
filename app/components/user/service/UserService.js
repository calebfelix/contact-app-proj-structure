const userConfig = require("../../../model-config/userConfig");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const { preloadAssociations } = require("../../../sequelize/association");
const { startTransaction } = require("../../../sequelize/transaction");
const {
  parseFilterQueries,
  parseLimitAndOffset,
  parseSelectFields,
} = require("../../../utils/request");
const contactConfig = require("../../../model-config/contactConfig");
const contactdetailConfig = require("../../../model-config/contactdetailConfig");
class UserService {
  constructor() {}
  associationMap = {
    contact: {
      model: contactConfig.model,
      as: "contact",
      include: {
        model: contactdetailConfig.model,
        as: "contactdetail",
      },
    },
  };

  async createUser(settingsConfig, body) {
    const t = await startTransaction();
    try {
      const logger = settingsConfig.logger;
      logger.info(`[UserService] : Inside createUser`);

      let hashedPassword = await bcrypt.hash(body.password, 12);
      body.id = uuidv4();
      body.isAdmin = false;
      body.password = hashedPassword;
      console.log(body);
      const data = await userConfig.model.create(body, { transaction: t });
      await t.commit();
      return data;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }
   verifyUserByUserName(settingsConfig, payload, username) {
    const logger = settingsConfig.logger;
    logger.info(`[UserService] : Inside verifyUserByUserName`);
    return payload.username == username;
  }
  async getAllUsers(settingsConfig, queryParams) {
    const t = await startTransaction();
    try {
      const logger = settingsConfig.logger;
      logger.info(`[UserService] : Inside getAllUsers`);

      const includeQuery = queryParams.include || [];
      let associations = [];
      const attributesToReturn = {
        id: userConfig.fieldMapping.id,
        firstName: userConfig.fieldMapping.firstName,
        lastName: userConfig.fieldMapping.lastName,
        email: userConfig.fieldMapping.email,
        username: userConfig.fieldMapping.username,
        isAdmin: userConfig.fieldMapping.isAdmin,
      };
      let selectArray = parseSelectFields(queryParams, attributesToReturn);
      if (!selectArray) {
        selectArray = Object.values(attributesToReturn);
      }
      if (includeQuery) {
        associations = this.createAssociation(includeQuery, selectArray);
      }
      const data = await userConfig.model.findAndCountAll({
        transaction: t,
        ...parseFilterQueries(queryParams, userConfig.filters),
        attributes: selectArray,
        ...parseLimitAndOffset(queryParams),
        ...preloadAssociations(associations),
      });
      await t.commit();
      return data;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async getUserById(settingsConfig, userId, queryParams) {
    const t = await startTransaction();
    try {
      const logger = settingsConfig.logger;
      logger.info(`[UserService] : Inside getUserById`);

      const includeQuery = queryParams.include || [];
      let associations = [];
      const attributesToReturn = {
        id: userConfig.fieldMapping.id,
        firstName: userConfig.fieldMapping.firstName,
        lastName: userConfig.fieldMapping.lastName,
        email: userConfig.fieldMapping.email,
        username: userConfig.fieldMapping.username,
        isAdmin: userConfig.fieldMapping.isAdmin,
      };
      let selectArray = parseSelectFields(queryParams, attributesToReturn);
      if (!selectArray) {
        selectArray = Object.values(attributesToReturn);
      }
      if (includeQuery) {
        associations = this.createAssociation(includeQuery, selectArray);
      }
      const data = await userConfig.model.findAll({
        where: { id: userId },
        attributes: selectArray,
        transaction: t,
        ...preloadAssociations(associations),
      });
      await t.commit();
      return data;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async updateUser(settingsConfig, userId, body) {
    const t = await startTransaction();
    try {
      const logger = settingsConfig.logger;
      logger.info(`[UserService] : Inside updateUser`);

      if(body?.firstName){
        await userConfig.model.update({ firstName: body.firstName },{ where: { id: userId }, transaction: t });
      }
      if(body?.lastName){
        await userConfig.model.update({ lastName: body.lastName },{ where: { id: userId }, transaction: t });
      }
      if(body?.email){
        await userConfig.model.update({ email: body.email },{ where: { id: userId }, transaction: t });
      }
      if(body?.username){
        await userConfig.model.update({ username: body.username },{ where: { id: userId }, transaction: t });
      }
      await t.commit();        
      return [1]
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async resetPassword(settingsConfig, userId, newPassword) {
    const t = await startTransaction();
    try {
      const logger = settingsConfig.logger;
      logger.info(`[UserService] : Inside resetPassword`);

      let hashedPassword = await bcrypt.hash(newPassword, 12);
      await userConfig.model.update({ password: hashedPassword },{ where: { id: userId }, transaction: t });
      await t.commit();        
      return [1]
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async deleteUser(settingsConfig, userId) {
    const t = await startTransaction();
    try {
      const logger = settingsConfig.logger;
      logger.info(`[UserService] : Inside deleteUser`);

      let deleted = await userConfig.model.destroy({
        where: {
          id: userId,
        },
        transaction: t,
      });
      await t.commit();
      return deleted;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async getUserByUsername(settingsConfig, username) {
    const t = await startTransaction();
    try {
      const logger = settingsConfig.logger;
      logger.info(`[UserService] : Inside getUserByUsername`);

      const data = await userConfig.model.findAll({
        transaction: t,
        where: { username: username },
      });
      await t.commit();
      return data;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async authenticateUser(settingsConfig, username, password) {
    try {
      const logger = settingsConfig.logger;
      logger.info(`[UserService] : Inside authenticateUser`);

      let [myUser] = await this.getUserByUsername(settingsConfig, username);
      if (myUser == undefined) {
        throw new Error("user Not Found");
      }

      let check = await bcrypt.compare(password, myUser.dataValues.password);
      if (!check) {
        throw new Error("authentication failed");
      }

      let myobj = {
        userId: myUser.dataValues.id,
        username: myUser.dataValues.username,
        isAdmin: myUser.dataValues.isAdmin,
      };
      let token = jwt.sign(myobj, process.env.JWT_SECRET_KEY, {
        expiresIn: 60 * 60,
      });

      return [token, myUser];
    } catch (error) {
      throw error;
    }
  }

  createAssociation(includeQuery, selectArray) {
    let associations = [];
    if (!Array.isArray(includeQuery)) {
      includeQuery = [includeQuery];
    }
    if (includeQuery?.includes(userConfig.associations.contactFilter)) {
      associations.push(this.associationMap.contact);
    }
    if (includeQuery?.includes(userConfig.associations.contactdetailFilter)) {
      associations.push(this.associationMap.contactdetail);
    }

    console.log(associations);
    return associations;
  }
}
module.exports = UserService;
