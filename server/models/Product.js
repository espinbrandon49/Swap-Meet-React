// models/Product.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection.js');

class Product extends Model { }

Product.init(
  {
    id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
    image_url: {
      type: DataTypes.STRING(2048),
      allowNull: true,
      validate: {
        isUrl: true,
        len: [1, 2048],
        isHttps(value) {
          if (value && !value.startsWith('https://')) {
            throw new Error('image_url must use HTTPS.');
          }
        },
      },
    },
    product_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { isDecimal: true, min: 0 },
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { isInt: true, min: 0 },
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'category', key: 'id' },
    },
  },
  {
    sequelize,
    modelName: 'product',
    tableName: 'product',
    freezeTableName: true,
    underscored: true,
    timestamps: false,
    indexes: [{ fields: ['category_id'] }],
  }
);

module.exports = Product;
