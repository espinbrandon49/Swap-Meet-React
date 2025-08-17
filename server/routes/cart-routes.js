const router = require('express').Router();
const { Cart, Product, Category, ProductCart } = require('../models');
const { validateToken } = require('../middleWares/AuthMiddlewares');

// POST /api/cart - ensure exactly one cart per user (idempotent)
router.post('/', validateToken, async (req, res) => {
  try {
    const [cart] = await Cart.findOrCreate({
      where: { user_id: req.user.id },
      defaults: { user_id: req.user.id },
    });
    res.status(201).json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/cart/me - caller's cart with items + quantities
router.get('/me', validateToken, async (req, res) => {
  try {
    const cart = await Cart.findOne({
      where: { user_id: req.user.id },
      include: [{
        model: Product,
        include: [{ model: Category }],
        through: { attributes: ['quantity'] },
      }],
    });
    if (!cart) return res.status(404).json({ message: 'No cart' });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/cart/items - add or increment a product in the cart
router.post('/items', validateToken, async (req, res) => {
  try {
    let { product_id, quantity = 1 } = req.body;

    // normalize & validate
    product_id = parseInt(product_id, 10);
    quantity = parseInt(quantity, 10);
    if (!Number.isInteger(product_id) || !Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({ error: 'product_id and quantity must be positive integers' });
    }

    // ownership: product must belong to a category owned by this user
    const prod = await Product.findByPk(product_id, {
      include: [{ model: Category, attributes: ['user_id'] }],
    });
    if (!prod || !prod.Category || prod.Category.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // ensure cart exists
    const [cart] = await Cart.findOrCreate({
      where: { user_id: req.user.id },
      defaults: { user_id: req.user.id },
    });

    // upsert + atomic increment for existing rows
    const [row, created] = await ProductCart.findOrCreate({
      where: { product_id, cart_id: cart.id },
      defaults: { product_id, cart_id: cart.id, quantity },
    });

    if (!created) {
      await row.increment('quantity', { by: quantity });
      await row.reload({ attributes: ['quantity'] });
    }

    res.status(201).json({ product_id, cart_id: cart.id, quantity: row.quantity });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/cart/items - remove one product from cart
router.delete('/items', validateToken, async (req, res) => {
  try {
    const product_id = parseInt(req.body.product_id, 10);
    if (!Number.isInteger(product_id)) {
      return res.status(400).json({ error: 'product_id must be an integer' });
    }

    const cart = await Cart.findOne({ where: { user_id: req.user.id } });
    if (!cart) return res.status(404).json({ message: 'No cart' });

    await ProductCart.destroy({ where: { product_id, cart_id: cart.id } });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
