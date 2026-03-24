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
  // USERS (shop-style names)
  // -----------------------------
  const sellerOne = await User.create({
    username: "cedar_thread",
    password: "Password123!",
  });

  const sellerTwo = await User.create({
    username: "lantern_house",
    password: "Password123!",
  });

  const sellerThree = await User.create({
    username: "second_mile_supply",
    password: "Password123!",
  });

  // -----------------------------
  // CATEGORIES (tight + curated)
  // -----------------------------
  const sellerOneCategories = await Category.bulkCreate(
    [
      { category_name: 'Vintage Denim', user_id: sellerOne.id },
      { category_name: 'Outerwear', user_id: sellerOne.id },
    ],
    { returning: true }
  );

  const sellerTwoCategories = await Category.bulkCreate(
    [
      { category_name: 'Home Finds', user_id: sellerTwo.id },
      { category_name: 'Accessories', user_id: sellerTwo.id },
    ],
    { returning: true }
  );

  const sellerThreeCategories = await Category.bulkCreate(
    [
      { category_name: 'Retro Streetwear', user_id: sellerThree.id },
      { category_name: 'Vinyl & Media', user_id: sellerThree.id },
    ],
    { returning: true }
  );

  // -----------------------------
  // PRODUCTS (curated + believable)
  // -----------------------------
  const productsOne = await Product.bulkCreate(
    [
      {
        product_name: 'Faded Carpenter Denim Jacket',
        description: 'Broken-in denim jacket with a relaxed vintage fit.',
        price: 64.99,
        stock: 8,
        category_id: sellerOneCategories[0].id,
        image_url: 'https://images.unsplash.com/photo-1523381294911-8d3cead13475'
      },
      {
        product_name: 'Washed Black Denim Vest',
        description: 'Sleeveless denim with a soft fade and worn edges.',
        price: 38.00,
        stock: 10,
        category_id: sellerOneCategories[0].id,
        image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7'
      },
      {
        product_name: 'Olive Utility Field Jacket',
        description: 'Lightweight field jacket with multiple pockets and vintage wear.',
        price: 72.50,
        stock: 6,
        category_id: sellerOneCategories[1].id,
        image_url: 'https://images.unsplash.com/photo-1520975922284-9e0ce827f6f1'
      },
      {
        product_name: 'Worn Canvas Work Coat',
        description: 'Heavy canvas coat with natural fading and durable stitching.',
        price: 88.00,
        stock: 5,
        category_id: sellerOneCategories[1].id,
        image_url: 'https://images.unsplash.com/photo-1516822003754-cca485356ecb'
      },
    ],
    { returning: true }
  );

  const productsTwo = await Product.bulkCreate(
    [
      {
        product_name: 'Brass Table Lamp',
        description: 'Secondhand brass lamp with warm tone and minor wear.',
        price: 44.99,
        stock: 7,
        category_id: sellerTwoCategories[0].id,
        image_url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee'
      },
      {
        product_name: 'Ceramic Coffee Set',
        description: 'Minimal ceramic set with a soft matte finish.',
        price: 32.00,
        stock: 12,
        category_id: sellerTwoCategories[0].id,
        image_url: 'https://images.unsplash.com/photo-1492724441997-5dc865305da7'
      },
      {
        product_name: 'Brown Leather Crossbody',
        description: 'Compact leather bag with natural wear and soft structure.',
        price: 36.50,
        stock: 9,
        category_id: sellerTwoCategories[1].id,
        image_url: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796'
      },
      {
        product_name: 'Worn Leather Belt',
        description: 'Full-grain leather belt with vintage patina.',
        price: 22.00,
        stock: 15,
        category_id: sellerTwoCategories[1].id,
        image_url: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb'
      },
    ],
    { returning: true }
  );

  const productsThree = await Product.bulkCreate(
    [
      {
        product_name: '90s Graphic Crewneck',
        description: 'Classic oversized sweatshirt with faded print.',
        price: 42.00,
        stock: 11,
        category_id: sellerThreeCategories[0].id,
        image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab'
      },
      {
        product_name: 'Distressed Street Hoodie',
        description: 'Heavyweight hoodie with a soft worn-in feel.',
        price: 48.99,
        stock: 10,
        category_id: sellerThreeCategories[0].id,
        image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7'
      },
      {
        product_name: 'Fleetwood Mac Vinyl Record',
        description: 'Classic vinyl in great condition with original sleeve.',
        price: 28.00,
        stock: 14,
        category_id: sellerThreeCategories[1].id,
        image_url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d'
      },
      {
        product_name: 'Vintage Jazz Record',
        description: 'Smooth jazz vinyl with light wear and rich sound.',
        price: 24.50,
        stock: 16,
        category_id: sellerThreeCategories[1].id,
        image_url: 'https://images.unsplash.com/photo-1513883049090-d0b7439799bf'
      },
    ],
    { returning: true }
  );

  const allProducts = [...productsOne, ...productsTwo, ...productsThree];

  // -----------------------------
  // TAGS (light, optional)
  // -----------------------------
  const tags = await Tag.bulkCreate(
    [
      'vintage',
      'denim',
      'streetwear',
      'home',
      'accessories',
      'vinyl',
    ].map(tag_name => ({ tag_name })),
    { returning: true }
  );

  // -----------------------------
  // PRODUCT TAGS
  // -----------------------------
  await ProductTag.bulkCreate([
    { product_id: productsOne[0].id, tag_id: tags[1].id },
    { product_id: productsOne[2].id, tag_id: tags[0].id },
    { product_id: productsThree[0].id, tag_id: tags[2].id },
    { product_id: productsTwo[0].id, tag_id: tags[3].id },
    { product_id: productsTwo[2].id, tag_id: tags[4].id },
    { product_id: productsThree[2].id, tag_id: tags[5].id },
  ]);

  // -----------------------------
  // CART (multi-shop demo)
  // -----------------------------
  const demoCart = await Cart.create({ user_id: sellerOne.id });

  await ProductCart.bulkCreate([
    { product_id: allProducts[0].id, cart_id: demoCart.id, quantity: 1 },
    { product_id: allProducts[5].id, cart_id: demoCart.id, quantity: 1 },
  ]);

  console.log("✅ Database seeded with curated vintage marketplace data!");
  process.exit(0);
};

seedAll();