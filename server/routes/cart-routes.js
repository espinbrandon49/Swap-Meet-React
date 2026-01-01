const router = require("express").Router();
const { Cart, Product, ProductCart } = require("../models");
const { validateToken } = require("../middleWares/AuthMiddlewares");

// CREATE or return existing cart for the user
router.post("/", validateToken, async (req, res) => {
  try {
    let cart = await Cart.findOne({ where: { user_id: req.user.id } });
    if (!cart) cart = await Cart.create({ user_id: req.user.id });
    res.status(201).json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET the current user's cart (with products + quantity)
router.get("/me", validateToken, async (req, res) => {
  try {
    const cart = await Cart.findOne({
      where: { user_id: req.user.id },
      include: [
        {
          model: Product,
          as: "products",
          through: { attributes: ["quantity"] },
        },
      ],
    });

    if (!cart) return res.status(404).json({ message: "Cart not found" });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADD item to cart
router.post("/items", validateToken, async (req, res) => {
  try {
    const product_id = Number(req.body.product_id);
    const qtyIn = Number(req.body.quantity ?? 1);

    if (!Number.isInteger(product_id)) {
      return res.status(400).json({ error: "product_id must be an integer" });
    }

    const addQty = Number.isFinite(qtyIn) && qtyIn > 0 ? qtyIn : 1;

    let cart = await Cart.findOne({ where: { user_id: req.user.id } });
    if (!cart) cart = await Cart.create({ user_id: req.user.id });

    const [row, created] = await ProductCart.findOrCreate({
      where: { cart_id: cart.id, product_id },
      defaults: { quantity: addQty },
    });

    if (!created) {
      row.quantity = Number(row.quantity || 0) + addQty;
      await row.save();
    }

    res.status(201).json({
      cart_id: cart.id,
      product_id,
      quantity: row.quantity,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// SET quantity (for +/- UI)
router.patch("/items", validateToken, async (req, res) => {
  try {
    const product_id = Number(req.body.product_id);
    const quantity = Number(req.body.quantity);

    if (!Number.isInteger(product_id)) {
      return res.status(400).json({ error: "product_id must be an integer" });
    }
    if (!Number.isFinite(quantity)) {
      return res.status(400).json({ error: "quantity must be a number" });
    }

    const cart = await Cart.findOne({ where: { user_id: req.user.id } });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const row = await ProductCart.findOne({
      where: { cart_id: cart.id, product_id },
    });
    if (!row) return res.status(404).json({ message: "Item not found" });

    if (quantity <= 0) {
      await row.destroy();
      return res.status(204).end();
    }

    row.quantity = Math.floor(quantity);
    if (row.quantity < 1) {
      await row.destroy();
      return res.status(204).end();
    }

    await row.save();
    res.json({ cart_id: cart.id, product_id, quantity: row.quantity });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// REMOVE item from cart
router.delete("/items", validateToken, async (req, res) => {
  try {
    const product_id = Number(req.body.product_id);

    const cart = await Cart.findOne({ where: { user_id: req.user.id } });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    await cart.removeProduct(product_id);
    res.status(204).end();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
