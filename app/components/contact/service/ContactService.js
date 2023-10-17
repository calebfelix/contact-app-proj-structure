const contactConfig = require("../../../model-config/contactConfig");
const { v4: uuidv4 } = require('uuid');
const {preloadAssociations} = require('../../../sequelize/association')
const { startTransaction } = require("../../../sequelize/transaction");
const {
  parseFilterQueries,
  parseLimitAndOffset,
  parseSelectFields,
} = require("../../../utils/request");
const contactdetailConfig = require("../../../model-config/contactdetailConfig");
class ContactService {
  constructor() {}
  associationMap = {
    contactdetail: {
      model: contactdetailConfig.model,
      as:"contactdetail"
    }
  }

  async createContact(settingsConfig,userId, body) {
    const t = await startTransaction();
    try {
      const logger = settingsConfig.logger;
      logger.info(`[UserService] : Inside createContact`);

      body.id = uuidv4()
      body.userId = userId
      const data = await contactConfig.model.create(body, {transaction:t})

      await t.commit();
      return data;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async getAllContacts(settingsConfig,userId, queryParams) {
    const t = await startTransaction();
    try {
      const logger = settingsConfig.logger;
      logger.info(`[ContactService] : Inside getAllContacts`);

      const includeQuery = queryParams.include || []
      let associations = []
      const attributesToReturn = {
        id: contactConfig.fieldMapping.id,
        firstName: contactConfig.fieldMapping.firstName,
        lastName: contactConfig.fieldMapping.lastName,
      };
      let selectArray = parseSelectFields(queryParams, attributesToReturn);
      if (!selectArray) {
        selectArray = Object.values(attributesToReturn);
      }
      if(includeQuery){
        associations = this.createAssociation(includeQuery, selectArray)
      }
      console.log(associations)
      const data = await contactConfig.model.findAndCountAll({
        transaction: t,
        ...parseFilterQueries(queryParams, contactConfig.filters,{user_id:userId}),
        attributes: selectArray,
        ...parseLimitAndOffset(queryParams),
        ...preloadAssociations(associations)
      });
      await t.commit();
      return data;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async getContactById(settingsConfig, userId,contactId, queryParams) {
    const t = await startTransaction();
    try {
      const logger = settingsConfig.logger;
      logger.info(`[ContactService] : Inside getContactById`);

      const includeQuery = queryParams.include || []
      let associations = []
      const attributesToReturn = {
        id: contactConfig.fieldMapping.id,
        firstName: contactConfig.fieldMapping.firstName,
        lastName: contactConfig.fieldMapping.lastName,
      };
      let selectArray = parseSelectFields(queryParams, attributesToReturn);
      if (!selectArray) {
        selectArray = Object.values(attributesToReturn);
      }
      if(includeQuery){
        associations = this.createAssociation(includeQuery, selectArray)
      }
      const data = await contactConfig.model.findAll({
        where:{id:contactId,user_id:userId, },
        attributes: selectArray,
        transaction: t,
        ...preloadAssociations(associations)
      });
      await t.commit();
      return data;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }
 
  async updateContact(settingsConfig, userId,contactId, body) {
    const t = await startTransaction();
    try {
      const logger = settingsConfig.logger;
      logger.info(`[ContactService] : Inside updateContact`);

      if(body?.firstName){
        await contactConfig.model.update({ firstName: body.firstName },{ where: { id: contactId, user_id: userId }, transaction: t });
      }
      if(body?.lastName){
        await contactConfig.model.update({ lastName: body.lastName },{ where: { id: contactId, user_id: userId }, transaction: t });
      }
      await t.commit();        
      return [1]

    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async deleteContact(settingsConfig, userId, contactId) {
    const t = await startTransaction();
    try {
      const logger = settingsConfig.logger;
      logger.info(`[ContactService] : Inside deleteContact`);

      let deleted = await contactConfig.model.destroy({
        where: {
          id: contactId,
          user_id: userId
        },
        transaction:t
      });
      await t.commit()
      return deleted;

    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  createAssociation(includeQuery, selectArray){
    let associations=[]
    if(!Array.isArray(includeQuery)){
      includeQuery=[includeQuery]
    }
    if(includeQuery?.includes(contactConfig.associations.contactdetailFilter)){
      associations.push(this.associationMap.contactdetail)
      console.log(associations)
    }
    return associations
  }
}


module.exports = ContactService;
