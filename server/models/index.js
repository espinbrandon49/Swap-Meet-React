const User = require('./Users');
const Category = require('./Category');
const Product = require('./Product');
const Tag = require('./Tag');
const ProductTag = require('./ProductTag');
const Cart = require('./Cart');
const ProductCart = require('./ProductCart');

// --------------------
// User ↔ Category
// --------------------
User.hasMany(Category, { foreignKey: 'user_id', onDelete: 'CASCADE', as: 'categories' });
Category.belongsTo(User, { foreignKey: 'user_id', as: 'owner' });

// --------------------
// Category ↔ Product
// --------------------
Category.hasMany(Product, { foreignKey: 'category_id', onDelete: 'CASCADE', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

// --------------------
// Product ↔ Tag (many-to-many)
// --------------------
Product.belongsToMany(Tag, { through: ProductTag, foreignKey: 'product_id', as: 'tags' });
Tag.belongsToMany(Product, { through: ProductTag, foreignKey: 'tag_id', as: 'products' });

// --------------------
// User ↔ Cart
// --------------------
User.hasOne(Cart, { foreignKey: 'user_id', onDelete: 'CASCADE', as: 'cart' });
Cart.belongsTo(User, { foreignKey: 'user_id', as: 'owner' });

// --------------------
// Cart ↔ Product (many-to-many)
// --------------------
Cart.belongsToMany(Product, { through: ProductCart, foreignKey: 'cart_id', as: 'products' });
Product.belongsToMany(Cart, { through: ProductCart, foreignKey: 'product_id', as: 'carts' });

module.exports = {
    User,
    Category,
    Product,
    Tag,
    ProductTag,
    Cart,
    ProductCart,
};
