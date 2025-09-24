// seeds/index.js
const sequelize = require('../config/connection.js');
const { User, Category, Product, Tag, ProductTag, Cart, ProductCart } = require('../models');

const seedAll = async () => {
  await sequelize.sync({ force: true });

  // USERS
  const demoUser = await User.create({
    username: "demo",
    password: "Demo123!",
  });

  // CATEGORIES (owned by demo user)
  const categories = await Category.bulkCreate([
    { category_name: 'Shirts', user_id: demoUser.id },
    { category_name: 'Shorts', user_id: demoUser.id },
    { category_name: 'Music', user_id: demoUser.id },
    { category_name: 'Hats', user_id: demoUser.id },
    { category_name: 'Shoes', user_id: demoUser.id },
  ], { returning: true });

  // PRODUCTS (no user_id; ownership flows via category -> user)
  const products = await Product.bulkCreate([
    { product_name: 'Plain T-Shirt', price: 14.99, stock: 14, category_id: categories[0].id, image_url: "https://picsum.photos/300" },
    { product_name: 'Colorful T-Shirt', price: 18.99, stock: 2, category_id: categories[0].id, image_url: "https://picsum.photos/400/300" },
    { product_name: 'Running Sneakers', price: 90.00, stock: 25, category_id: categories[4].id, image_url: "https://picsum.photos/300" },
    { product_name: 'Branded Baseball Hat', price: 22.99, stock: 12, category_id: categories[3].id, image_url: "https://picsum.photos/400/300" },
    { product_name: 'Top 40 Vinyl Record', price: 12.99, stock: 50, category_id: categories[2].id, image_url: "https://picsum.photos/300" },
    { product_name: 'Cargo Shorts', price: 29.99, stock: 22, category_id: categories[1].id, image_url: "https://picsum.photos/400/300" },
  ], { returning: true });

  // TAGS
  const tags = await Tag.bulkCreate(
    ['rock music', 'pop music', 'blue', 'red', 'green', 'white', 'gold', 'pop culture'].map(tag_name => ({ tag_name })),
    { returning: true }
  );

  // PRODUCT TAGS
  await ProductTag.bulkCreate([
    { product_id: products[0].id, tag_id: tags[5].id },
    { product_id: products[0].id, tag_id: tags[6].id },
    { product_id: products[1].id, tag_id: tags[2].id },
    { product_id: products[2].id, tag_id: tags[0].id },
    { product_id: products[2].id, tag_id: tags[3].id },
    { product_id: products[3].id, tag_id: tags[1].id },
    { product_id: products[3].id, tag_id: tags[7].id },
    { product_id: products[4].id, tag_id: tags[0].id },
  ]);

  // CART for demo user + line items
  const demoCart = await Cart.create({ user_id: demoUser.id });
  await ProductCart.bulkCreate([
    { product_id: products[0].id, cart_id: demoCart.id, quantity: 1 },
    { product_id: products[2].id, cart_id: demoCart.id, quantity: 1 },
  ]);

  console.log("✅ Database successfully seeded!");
  process.exit(0);
};

seedAll();
