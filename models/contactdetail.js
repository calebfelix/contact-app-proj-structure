'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class contactdetail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      contactdetail.belongsTo(models.contact,{
        foreignKey: 'contact_id',
        as:'contact'
      })
    }
  }
  contactdetail.init({
    contactdetailType: DataTypes.STRING,
    contactdetailValue: DataTypes.STRING,
    contactId: DataTypes.UUID,
  }, {
    sequelize,
    modelName: 'contactdetail',
    underscored: true,
    paranoid:true
  });
  return contactdetail;
};