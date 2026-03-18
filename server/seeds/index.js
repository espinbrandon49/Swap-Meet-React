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
  // USERS (clean presentation names)
  // -----------------------------
  const primarySeller = await User.create({
    username: "urban_threads",
    password: "Password123!",
  });

  const secondSeller = await User.create({
    username: "gallery_supply",
    password: "Password123!",
  });

  // -----------------------------
  // CATEGORIES
  // -----------------------------
  const primaryCategories = await Category.bulkCreate(
    [
      { category_name: 'Apparel', user_id: primarySeller.id },
      { category_name: 'Footwear', user_id: primarySeller.id },
      { category_name: 'Music', user_id: primarySeller.id },
    ],
    { returning: true }
  );

  const secondCategories = await Category.bulkCreate(
    [
      { category_name: 'Art Prints', user_id: secondSeller.id },
      { category_name: 'Accessories', user_id: secondSeller.id },
    ],
    { returning: true }
  );

  // -----------------------------
  // PRODUCTS (clean + realistic)
  // -----------------------------
  const primaryProducts = await Product.bulkCreate(
    [
      {
        product_name: 'Classic White Tee',
        description: 'Soft cotton t-shirt with a clean, everyday fit.',
        price: 18.99,
        stock: 25,
        category_id: primaryCategories[0].id,
        image_url: 'https://images.unsplash.com/photo-1523381294911-8d3cead13475'
      },
      {
        product_name: 'Black Street Hoodie',
        description: 'Midweight hoodie designed for comfort and style.',
        price: 49.99,
        stock: 15,
        category_id: primaryCategories[0].id,
        image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7'
      },
      {
        product_name: 'Running Sneakers',
        description: 'Lightweight sneakers built for daily wear and training.',
        price: 89.99,
        stock: 20,
        category_id: primaryCategories[1].id,
        image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff'
      },
      {
        product_name: 'Vinyl Record Collection',
        description: 'Curated selection of classic and modern albums.',
        price: 24.99,
        stock: 30,
        category_id: primaryCategories[2].id,
        image_url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d'
      },
    ],
    { returning: true }
  );

  const secondProducts = await Product.bulkCreate(
    [
      {
        product_name: 'Abstract Wall Art',
        description: 'Modern abstract print for home or office spaces.',
        price: 39.99,
        stock: 12,
        category_id: secondCategories[0].id,
        image_url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee'
      },
      {
        product_name: 'Minimalist Poster Set',
        description: 'Clean, minimal poster designs for modern interiors.',
        price: 29.99,
        stock: 18,
        category_id: secondCategories[0].id,
        image_url: 'https://images.unsplash.com/photo-1492724441997-5dc865305da7'
      },
      {
        product_name: 'Leather Keychain',
        description: 'Durable handcrafted leather keychain.',
        price: 14.99,
        stock: 40,
        category_id: secondCategories[1].id,
        image_url: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796'
      },
    ],
    { returning: true }
  );

  const products = [...primaryProducts, ...secondProducts];

  // -----------------------------
  // TAGS
  // -----------------------------
  const tags = await Tag.bulkCreate(
    [
      'casual',
      'streetwear',
      'fitness',
      'music',
      'art',
      'minimal',
    ].map(tag_name => ({ tag_name })),
    { returning: true }
  );

  // -----------------------------
  // PRODUCT TAGS
  // -----------------------------
  await ProductTag.bulkCreate([
    { product_id: primaryProducts[0].id, tag_id: tags[0].id },
    { product_id: primaryProducts[1].id, tag_id: tags[1].id },
    { product_id: primaryProducts[2].id, tag_id: tags[2].id },
    { product_id: primaryProducts[3].id, tag_id: tags[3].id },
    { product_id: secondProducts[0].id, tag_id: tags[4].id },
    { product_id: secondProducts[1].id, tag_id: tags[5].id },
  ]);

  // -----------------------------
  // CART (multi-shop demo)
  // -----------------------------
  const demoCart = await Cart.create({ user_id: primarySeller.id });

  await ProductCart.bulkCreate([
    { product_id: primaryProducts[0].id, cart_id: demoCart.id, quantity: 1 },
    { product_id: secondProducts[0].id, cart_id: demoCart.id, quantity: 1 },
  ]);

  console.log("✅ Database seeded with clean portfolio data!");
  process.exit(0);
};

seedAll();