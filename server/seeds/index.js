const bcrypt = require('bcrypt');
const sequelize = require('../config/connection');
const { Users, Category, Product, Tag, ProductTag, Cart, ProductCart } = require('../models');

const seedAll = async () => {
  await sequelize.sync({ force: true });
  console.log('\n----- DATABASE SYNCED -----\n');

  // USERS
  const hashedPassword = await bcrypt.hash("Demo123!", 10);
  const demoUser = await Users.create({
    username: "demo",
    password: hashedPassword,
    image: null,
  });
  console.log('✅ Users seeded');

  // CATEGORIES
  const categories = await Category.bulkCreate([
    { category_name: 'Shirts', username: demoUser.username },
    { category_name: 'Shorts', username: demoUser.username },
    { category_name: 'Music', username: demoUser.username },
    { category_name: 'Hats', username: demoUser.username },
    { category_name: 'Shoes', username: demoUser.username },
  ], { returning: true });
  console.log('✅ Categories seeded');

  // PRODUCTS
  const products = await Product.bulkCreate([
    {
      product_name: 'Plain T-Shirt',
      username: demoUser.username,
      price: 14.99,
      stock: 14,
      category_id: categories[0].id,
    },
    {
      product_name: 'Colorful T-Shirt',
      username: demoUser.username,
      price: 18.99,
      stock: 2,
      category_id: categories[0].id,
    },
    {
      product_name: 'Running Sneakers',
      username: demoUser.username,
      price: 90.0,
      stock: 25,
      category_id: categories[4].id,
    },
    {
      product_name: 'Branded Baseball Hat',
      username: demoUser.username,
      price: 22.99,
      stock: 12,
      category_id: categories[3].id,
    },
    {
      product_name: 'Top 40 Vinyl Record',
      username: demoUser.username,
      price: 12.99,
      stock: 50,
      category_id: categories[2].id,
    },
    {
      product_name: 'Cargo Shorts',
      username: demoUser.username,
      price: 29.99,
      stock: 22,
      category_id: categories[1].id,
    },
  ], { returning: true });
  console.log('✅ Products seeded');

  // TAGS
  const tags = await Tag.bulkCreate([
    { tag_name: 'rock music' },
    { tag_name: 'pop music' },
    { tag_name: 'blue' },
    { tag_name: 'red' },
    { tag_name: 'green' },
    { tag_name: 'white' },
    { tag_name: 'gold' },
    { tag_name: 'pop culture' },
  ], { returning: true });
  console.log('✅ Tags seeded');

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
  console.log('✅ ProductTags seeded');

  // CART
  // CART for demo user
  const demoCart = await Cart.create({ user_id: demoUser.id });
  console.log("✅ Cart created for demo user");

  // PRODUCT–CART links
  await ProductCart.bulkCreate([
    { product_id: products[0].id, cart_id: demoCart.id, },
    { product_id: products[2].id, cart_id: demoCart.id, },
  ]);
  console.log("✅ Cart items seeded");

  process.exit(0);
};

seedAll();
