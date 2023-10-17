const { StatusCodes } = require("http-status-codes")
const ContactService = require("../service/ContactService");
const {isCurrentUser} = require("../../../middleware/authService")

class ContactController {
    constructor() {
        this.contactService = new ContactService()
    }

    async getAllContacts(settingsConfig, req, res, next) {
        try {
            const logger = settingsConfig.logger;
            logger.info(`[ContactController] : Inside getAllContacts`);

            isCurrentUser(settingsConfig, req, res, next)

            const queryParams = req.query
            let userId = req.params.userId
            const { count, rows } = await this.contactService.getAllContacts(settingsConfig,userId,queryParams)
            res.set('X-Total-Count', count)
            res.status(StatusCodes.OK).json(rows)
            return
        } catch (error) {
            next(error)
        }
    }

    async getContactById(settingsConfig, req, res, next) {
        try {
            const logger = settingsConfig.logger;
            logger.info(`[ContactController] : Inside getContactById`);
            
            isCurrentUser(settingsConfig, req, res, next)

            const {userId, contactId} = req.params
            console.log(userId,contactId)

            const user = await this.contactService.getContactById(settingsConfig,userId,contactId,req.query)
            res.status(StatusCodes.OK).json(user)
            return
        } catch (error) {
            next(error)
        }
    }

    async createContact(settingsConfig, req, res, next) {
        try {
            const logger = settingsConfig.logger;
            logger.info(`[ContactController] : Inside createContact`);

            isCurrentUser(settingsConfig, req, res, next)

            const {userId} = req.params
            const newContact= await this.contactService.createContact(settingsConfig,userId, req.body)
            
            res.status(StatusCodes.CREATED).json(newContact)
            return
        } catch (error) {
            next(error)
        }
    }

    async updateContact(settingsConfig, req, res, next) {
        try {
            const logger = settingsConfig.logger;
            logger.info(`[ContactController] : Inside updateContact`);
       
            isCurrentUser(settingsConfig, req, res, next)

            const {userId, contactId} = req.params
            const user = await this.contactService.getContactById(settingsConfig, userId,contactId, req.query)
            if(user.length == 0){
                throw new Error("Contact Not Found!")
            }

            const [contactUpdated] = await this.contactService.updateContact(settingsConfig,userId,contactId, req.body)
            if(contactUpdated==0){
                throw new Error("Could Not Update Contact")
            }
            res.status(StatusCodes.OK).json("Contact Updated")
            return
        } catch (error) {
            next(error)
        }
    }

    async deleteContact(settingsConfig, req, res, next) {
        try {
            const logger = settingsConfig.logger;
            logger.info(`[ContactController] : Inside deleteContact`);
            
            isCurrentUser(settingsConfig, req, res, next)

            const {userId, contactId} = req.params
            const user = await this.contactService.getContactById(settingsConfig, userId,contactId, req.query)
            if(user.length == 0){
                throw new Error("Contact Not Found!")
            }

            const contactDeleted = await this.contactService.deleteContact(settingsConfig,userId,contactId)
            if(contactDeleted==0){
                throw new Error("Could Not Delete Contact")
            }
            res.status(StatusCodes.OK).json("Contact Deleted")
            return
        } catch (error) {
            next(error)
        }
    }

}

module.exports = new ContactController()