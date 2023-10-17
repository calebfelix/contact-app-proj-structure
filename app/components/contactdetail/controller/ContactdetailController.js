const { StatusCodes } = require("http-status-codes")
const ContactdetailService = require("../service/ContactdetailService.js");
// const {isCurrentUser } = require("../../../middleware/authService");

class ContactController {
    constructor() {
        this.contactdetailService = new ContactdetailService()
    }

    async getAllContactdetails(settingsConfig, req, res, next) {
        try {
            const logger = settingsConfig.logger;
            logger.info(`[ContactController] : Inside getAllContactdetails`);

            
            const queryParams = req.query
            let contactId = req.params.contactId
            let contactdetailId = req.params.contactdetailId
            const { count, rows } = await this.contactdetailService.getAllContactdetails(settingsConfig,contactId,queryParams)
            res.set('X-Total-Count', count)
            res.status(StatusCodes.OK).json(rows)
            return
        } catch (error) {
            next(error)
        }
    }

    async getContactdetailById(settingsConfig, req, res, next) {
        try {
            const logger = settingsConfig.logger;
            logger.info(`[ContactController] : Inside getContactdetailById`);

            const {userId, contactId, contactdetailId} = req.params

            
            const user = await this.contactdetailService.getContactdetailById(settingsConfig,contactId,contactdetailId,req.query)
            res.status(StatusCodes.OK).json(user)
            return
        } catch (error) {
            next(error)
        }
    }

    async createContactdetail(settingsConfig, req, res, next) {
        try {
            const logger = settingsConfig.logger;
            logger.info(`[ContactController] : Inside createContactdetail`);

            const {userId, contactId} = req.params
            console.log("herr")
            const newContact= await this.contactdetailService.createContactdetail(settingsConfig,contactId, req.body)
            
            res.status(StatusCodes.CREATED).json(newContact)
            return
        } catch (error) {
            next(error)
        }
    }

    async updateContactdetail(settingsConfig, req, res, next) {
        try {
            const logger = settingsConfig.logger;
            logger.info(`[ContactController] : Inside updateContactdetail`);
            
            const {userId, contactId, contactdetailId} = req.params
            const user = await this.contactdetailService.getContactdetailById(settingsConfig,contactId,contactdetailId, req.query)
            if(user.length == 0){
                throw new Error("Contact detail Not Found!")
            }

            const [contactUpdated] = await this.contactdetailService.updateContactdetail(settingsConfig,contactdetailId, req.body)
            if(contactUpdated==0){
                throw new Error("Could Not Update Contact detail")
            }
            res.status(StatusCodes.OK).json("Contact detail Updated")
            return
        } catch (error) {
            next(error)
        }
    }

    async deleteContactdetail(settingsConfig, req, res, next) {
        try {
            const logger = settingsConfig.logger;
            logger.info(`[ContactController] : Inside deleteContactdetail`);
            
            const {userId, contactId, contactdetailId} = req.params
            const user = await this.contactdetailService.getContactdetailById(settingsConfig, contactId,contactdetailId, req.query)
            if(user.length == 0){
                throw new Error("Contact detail Not Found!")
            }

            const contactDeleted = await this.contactdetailService.deleteContactdetail(settingsConfig,contactdetailId)
            if(contactDeleted==0){
                throw new Error("Could Not Delete Contact detail")
            }
            res.status(StatusCodes.OK).json("Contact detail Deleted")
            return
        } catch (error) {
            next(error)
        }
    }

}

module.exports = new ContactController()