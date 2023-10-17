const db = require("../../models")
const { validateStringLength } = require("../utils/string")
const { validateUuid } = require("../utils/uuid")
const { Op, Sequelize, Association } = require("sequelize")
class ContactdetailConfig {
    constructor() {
        this.fieldMapping = Object.freeze(
            {
                id: "id",
                contactdetailType: "contactdetailType",
                contactdetailValue: "contactdetailValue",
                contactId:"contactId"
            }
        )
        this.model = db.contactdetail
        this.modelName = db.contactdetail.name
        this.tableName = db.contactdetail.tableName
   
        this.filters = Object.freeze({
            id: (id) => {
                validateUuid(id, "contact config")
                return {
                    [this.fieldMapping.id]: {
                        [Op.eq]: id
                    }
                }
            },
            contactdetailType: (contactdetailType) => {
                validateStringLength(contactdetailType, "contactdetailType", undefined, 255)
                return {
                    [this.fieldMapping.contactdetailType]: {
                        [Op.like]: `%${contactdetailType}%`
                    }
                }
            },
            contactdetailValue: (contactdetailValue) => {
                validateStringLength(contactdetailValue, "contactdetailValue", undefined, 255)
                return {
                    [this.fieldMapping.contactdetailValue]: {
                        [Op.like]: `%${contactdetailValue}%`
                    }
                }
            }
        })

        
    }
}
const contactdetailConfig = new ContactdetailConfig()
// deepFreeze(userConfig)

module.exports = contactdetailConfig
