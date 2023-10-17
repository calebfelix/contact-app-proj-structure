const db = require("../../models")
const { validateStringLength } = require("../utils/string")
const { validateUuid } = require("../utils/uuid")
const { Op, Sequelize, Association } = require("sequelize")
class ContactConfig {
    constructor() {
        this.fieldMapping = Object.freeze(
            {
                id: "id",
                firstName: "firstName",
                lastName: "lastName",
                userId:"userId"
            }
        )
        this.model = db.contact
        this.modelName = db.contact.name
        this.tableName = db.contact.tableName

        this.columnMapping = Object.freeze({
            id: this.model.rawAttributes[this.fieldMapping.id].field,
            firstName: this.model.rawAttributes[this.fieldMapping.firstName].field,
            lastName: this.model.rawAttributes[this.fieldMapping.lastName].field,
            userId: this.model.rawAttributes[this.fieldMapping.userId].field,
          })

        this.filters = Object.freeze({
            id: (id) => {
                validateUuid(id, "contact config")
                return {
                    [this.fieldMapping.id]: {
                        [Op.eq]: id
                    }
                }
            },
            firstName: (firstName) => {
                validateStringLength(firstName, "firstName", undefined, 255)
                return {
                    [this.fieldMapping.firstName]: {
                        [Op.like]: `%${firstName}%`
                    }
                }
            },
            lastName: (lastName) => {
                validateStringLength(lastName, "lastName", undefined, 255)
                return {
                    [this.fieldMapping.lastName]: {
                        [Op.like]: `%${lastName}%`
                    }
                }
            }
        })

        this.associations = Object.freeze({
            contactdetailFilter:'contactdetailFilter'
        })
    }
}
const contactConfig = new ContactConfig()
// deepFreeze(userConfig)

module.exports = contactConfig
