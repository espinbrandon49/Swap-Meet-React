const router = require('express').Router();
const { Cart, Product } = require('../models');
const { validateToken } = require('../middleWares/AuthMiddlewares');

// CREATE or return existing cart for the user
router.post('/', validateToken, async (req, res) => {
  try {
    let cart = await Cart.findOne({ where: { user_id: req.user.id } });
    if (!cart) {
      cart = await Cart.create({ user_id: req.user.id });
    }
    res.status(201).json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET the current user's cart (with products)
router.get('/me', validateToken, async (req, res) => {
  try {
    const cart = await Cart.findOne({
      where: { user_id: req.user.id },
      include: [{ model: Product, as: 'products' }], // ✅ must match alias in models/index.js
    });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADD item to cart
router.post('/items', validateToken, async (req, res) => {
  try {
    const { product_id, quantity } = req.body;

    let cart = await Cart.findOne({ where: { user_id: req.user.id } });
    if (!cart) {
      cart = await Cart.create({ user_id: req.user.id });
    }

    await cart.addProduct(product_id, { through: { quantity } });
    res.status(201).json({ cart_id: cart.id, product_id, quantity });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// REMOVE item from cart
router.delete('/items', validateToken, async (req, res) => {
  try {
    const { product_id } = req.body;

    const cart = await Cart.findOne({ where: { user_id: req.user.id } });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    await cart.removeProduct(product_id);
    res.status(204).end();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
