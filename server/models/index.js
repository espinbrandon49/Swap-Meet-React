// models/index.js
const Product = require('./Product');
const Category = require('./Category');
const Tag = require('./Tag');
const ProductTag = require('./ProductTag');
const Users = require('./Users');
const Cart = require('./Cart');
const ProductCart = require('./ProductCart');

// ---- Associations ----

// Users <-> Category (1:M)
Users.hasMany(Category, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Category.belongsTo(Users, { foreignKey: 'user_id', onDelete: 'CASCADE' });

// Category <-> Product (1:M)  — OPTION 1
Category.hasMany(Product, { foreignKey: 'category_id' });
Product.belongsTo(Category, { foreignKey: 'category_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

// Product <-> Tag (M:N)
Product.belongsToMany(Tag, { through: ProductTag, foreignKey: 'product_id', otherKey: 'tag_id', onDelete: 'CASCADE' });
Tag.belongsToMany(Product, { through: ProductTag, foreignKey: 'tag_id', otherKey: 'product_id', onDelete: 'CASCADE' });

// Users <-> Cart (1:1)
Users.hasOne(Cart, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Cart.belongsTo(Users, { foreignKey: 'user_id', onDelete: 'CASCADE' });

// Product <-> Cart (M:N)
Product.belongsToMany(Cart, { through: ProductCart, foreignKey: 'product_id', otherKey: 'cart_id', onDelete: 'CASCADE' });
Cart.belongsToMany(Product, { through: ProductCart, foreignKey: 'cart_id', otherKey: 'product_id', onDelete: 'CASCADE' });

module.exports = { Product, Category, Tag, ProductTag, Users, Cart, ProductCart };
