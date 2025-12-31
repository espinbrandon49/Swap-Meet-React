// seeds/index.js
const sequelize = require('../config/connection.js');
const {
  User,
  Category,
  Product,
  Tag,
  ProductTag,
  Cart,
  ProductCart
} = require('../models');

const seedAll = async () => {
  await sequelize.sync({ force: true });

  // -----------------------------
  // USERS
  // -----------------------------
  const demoUser = await User.create({
    username: "demo",
    password: "Demo123!",
  });

  const altUser = await User.create({
    username: "seller2",
    password: "Seller123!",
  });

  // -----------------------------
  // CATEGORIES (owned per user)
  // -----------------------------
  const demoCategories = await Category.bulkCreate(
    [
      { category_name: 'Shirts', user_id: demoUser.id },
      { category_name: 'Shorts', user_id: demoUser.id },
      { category_name: 'Music', user_id: demoUser.id },
      { category_name: 'Hats', user_id: demoUser.id },
      { category_name: 'Shoes', user_id: demoUser.id },
    ],
    { returning: true }
  );

  const altCategories = await Category.bulkCreate(
    [
      { category_name: 'Art Prints', user_id: altUser.id },
      { category_name: 'Accessories', user_id: altUser.id },
    ],
    { returning: true }
  );

  // -----------------------------
  // PRODUCTS (ownership via category)
  // -----------------------------
  const demoProducts = await Product.bulkCreate(
    [
      { product_name: 'Plain T-Shirt', price: 14.99, stock: 14, category_id: demoCategories[0].id, image_url: "https://picsum.photos/300" },
      { product_name: 'Colorful T-Shirt', price: 18.99, stock: 2, category_id: demoCategories[0].id, image_url: "https://picsum.photos/400/300" },
      { product_name: 'Running Sneakers', price: 90.00, stock: 25, category_id: demoCategories[4].id, image_url: "https://picsum.photos/300" },
      { product_name: 'Branded Baseball Hat', price: 22.99, stock: 12, category_id: demoCategories[3].id, image_url: "https://picsum.photos/400/300" },
      { product_name: 'Top 40 Vinyl Record', price: 12.99, stock: 50, category_id: demoCategories[2].id, image_url: "https://picsum.photos/300" },
      { product_name: 'Cargo Shorts', price: 29.99, stock: 22, category_id: demoCategories[1].id, image_url: "https://picsum.photos/400/300" },
    ],
    { returning: true }
  );

  const altProducts = await Product.bulkCreate(
    [
      { product_name: 'Abstract Art Print', price: 45.00, stock: 10, category_id: altCategories[0].id, image_url: "https://picsum.photos/400/300" },
      { product_name: 'Minimalist Wall Poster', price: 28.00, stock: 20, category_id: altCategories[0].id, image_url: "https://picsum.photos/300" },
      { product_name: 'Leather Keychain', price: 12.50, stock: 40, category_id: altCategories[1].id, image_url: "https://picsum.photos/300" },
    ],
    { returning: true }
  );

  const products = [...demoProducts, ...altProducts];

  // -----------------------------
  // TAGS
  // -----------------------------
  const tags = await Tag.bulkCreate(
    [
      'rock music',
      'pop music',
      'blue',
      'red',
      'green',
      'white',
      'gold',
      'pop culture',
      'art',
      'minimal',
    ].map(tag_name => ({ tag_name })),
    { returning: true }
  );

  // -----------------------------
  // PRODUCT TAGS (sample)
  // -----------------------------
  await ProductTag.bulkCreate([
    { product_id: demoProducts[0].id, tag_id: tags[5].id },
    { product_id: demoProducts[1].id, tag_id: tags[2].id },
    { product_id: demoProducts[2].id, tag_id: tags[0].id },
    { product_id: altProducts[0].id, tag_id: tags[8].id },
    { product_id: altProducts[1].id, tag_id: tags[9].id },
  ]);

  // -----------------------------
  // CART (multi-shop demo)
  // -----------------------------
  const demoCart = await Cart.create({ user_id: demoUser.id });

  await ProductCart.bulkCreate([
    // demo user products
    { product_id: demoProducts[0].id, cart_id: demoCart.id, quantity: 1 },
    { product_id: demoProducts[2].id, cart_id: demoCart.id, quantity: 1 },

    // second user products (this proves multi-shop cart)
    { product_id: altProducts[0].id, cart_id: demoCart.id, quantity: 1 },
  ]);

  console.log("✅ Database successfully seeded with multi-shop data!");
  process.exit(0);
};

seedAll();
