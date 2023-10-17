const db = require("../../models")
const user = require("../../models/user")
const { validateStringLength } = require("../utils/string")
const { validateUuid } = require("../utils/uuid")
const { Op, Sequelize } = require("sequelize")
class UserConfig {
    constructor() {
        this.fieldMapping = Object.freeze(
            {
                id: "id",
                firstName: "firstName",
                lastName: "lastName",
                email: "email",
                username: "username",
                password: "password",
                isAdmin: "isAdmin"
            }
        )
        this.model = db.user
        this.modelName = db.user.name
        this.tableName = db.user.tableName

        this.columnMapping = Object.freeze({
            id: this.model.rawAttributes[this.fieldMapping.id].field,
            firstName: this.model.rawAttributes[this.fieldMapping.firstName].field,
            lastName: this.model.rawAttributes[this.fieldMapping.lastName].field,
            email: this.model.rawAttributes[this.fieldMapping.email].field,
            username: this.model.rawAttributes[this.fieldMapping.username].field,
            password: this.model.rawAttributes[this.fieldMapping.password].field,
            isAdmin: this.model.rawAttributes[this.fieldMapping.isAdmin].field,
          })
   
        this.filters = Object.freeze({
            email: (email) => {
                validateStringLength(email, "email", undefined, 255)
                return Sequelize.where(Sequelize.fn("lower",
                    Sequelize.col(this.columnMapping.email)),
                    { [Op.like]: `%${email.toLowerCase()}%` }
                )
            },
            id: (id) => {
                validateUuid(id, "user config")
                return {
                    [this.fieldMapping.id]: {
                        // [Op.like]: `%${id}%`
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
            },
            username: (username) => {
                validateStringLength(username, "username", undefined, 255)
                return {
                    [this.fieldMapping.username]: {
                        [Op.like]: `%${username}%`
                    }
                }
            },
            isAdmin: (isAdmin) => {
                return {
                    [this.fieldMapping.isAdmin]: {
                        [Op.eq]: isAdmin
                    }
                }
            }
        })

        this.associations = Object.freeze({
            contactFilter:'contactFilter',
            contactdetailFilter:'contactdetailFilter'
        })
    }
}
const userConfig = new UserConfig()
// deepFreeze(userConfig)

module.exports = userConfig
