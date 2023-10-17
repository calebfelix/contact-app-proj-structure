const contactdetailConfig = require("../../../model-config/contactdetailConfig");
const { v4: uuidv4 } = require('uuid');
const {preloadAssociations} = require('../../../sequelize/association')
const { startTransaction } = require("../../../sequelize/transaction");
const {
  parseFilterQueries,
  parseLimitAndOffset,
  parseSelectFields,
} = require("../../../utils/request");

class ContactdetailService {
  constructor() {}

  async createContactdetail(settingsConfig, contactId, body) {
    const t = await startTransaction();
    try {
      const logger = settingsConfig.logger;
      logger.info(`[ContactdetailService] : Inside createContactdetail`);

      body.id = uuidv4()
      body.contactId = contactId
      console.log(body)
      const data = await contactdetailConfig.model.create(body, {transaction:t})

      await t.commit();
      return data;
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async getAllContactdetails(settingsConfig,contactId, queryParams) {
    const t = await startTransaction();
    try {
      const logger = settingsConfig.logger;
      logger.info(`[ContactdetailService] : Inside getAllContactdetails`);

      const includeQuery = queryParams.include || []
      let associations = []
      const attributesToReturn = {
        id: contactdetailConfig.fieldMapping.id,
        contactdetailType: contactdetailConfig.fieldMapping.contactdetailType,
        contactdetailValue: contactdetailConfig.fieldMapping.contactdetailValue,
      };
      let selectArray = parseSelectFields(queryParams, attributesToReturn);
      if (!selectArray) {
        selectArray = Object.values(attributesToReturn);
      }
      const data = await contactdetailConfig.model.findAndCountAll({
        transaction: t,
        ...parseFilterQueries(queryParams, contactdetailConfig.filters,{contact_id:contactId}),
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

  async getContactdetailById(settingsConfig,contactId,contactdetailId, queryParams) {
    const t = await startTransaction();
    try {
      const logger = settingsConfig.logger;
      logger.info(`[ContactdetailService] : Inside getContactByIdetaild`);

      const includeQuery = queryParams.include || []
      let associations = []
      const attributesToReturn = {
        id: contactdetailConfig.fieldMapping.id,
        contactdetailType: contactdetailConfig.fieldMapping.contactdetailType,
        contactdetailValue: contactdetailConfig.fieldMapping.contactdetailValue,
      };
      let selectArray = parseSelectFields(queryParams, attributesToReturn);
      if (!selectArray) {
        selectArray = Object.values(attributesToReturn);
      }

      const data = await contactdetailConfig.model.findAll({
        where:{id:contactdetailId,contact_id:contactId, },
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
 
  async updateContactdetail(settingsConfig, contactdetailId, body) {
    const t = await startTransaction();
    try {
      const logger = settingsConfig.logger;
      logger.info(`[ContactdetailService] : Inside updateContactdetail`);
      
      if(body?.contactdetailType){
        await contactdetailConfig.model.update({ contactdetailType: body.contactdetailType },{ where: { id: contactdetailId }, transaction: t });
      }
      if(body?.contactdetailValue){
        await contactdetailConfig.model.update({ contactdetailValue: body.contactdetailValue },{ where: { id: contactdetailId }, transaction: t });
      }
      await t.commit();        
      return [1]
      }  catch (error) {
      await t.rollback();
      throw error;
    }
  }

  async deleteContactdetail(settingsConfig, contactdetailId) {
    const t = await startTransaction();
    try {
      const logger = settingsConfig.logger;
      logger.info(`[ContactdetailService] : Inside deleteContactdetail`);

      let deleted = await contactdetailConfig.model.destroy({
        where: {
          id: contactdetailId,
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

}


module.exports = ContactdetailService;
