const router = require("express").Router();
const { Category, Product, User } = require("../models");
const { validateToken } = require("../middleWares/AuthMiddlewares");

// GET all categories (with owner + products) → GLOBAL
router.get("/", async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: [
        {
          model: User,
          as: "owner",
          attributes: ["id", "username"],
        },
        {
          model: Product,
          as: "products",
        },
      ],
    });

    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET single category by id (with owner + products) → GLOBAL
router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: User,
          as: "owner",
          attributes: ["id", "username"],
        },
        {
          model: Product,
          as: "products",
        },
      ],
    });

    if (!category) return res.status(404).json({ error: "Not found" });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// CREATE a category → OWNER ONLY
router.post("/", validateToken, async (req, res) => {
  try {
    const category_name = (req.body.category_name || "").trim();

    if (!category_name) {
      return res.status(400).json({ error: "category_name is required" });
    }

    const category = await Category.create({
      category_name,
      user_id: req.user.id,
    });

    const created = await Category.findOne({
      where: { id: category.id },
      include: [
        {
          model: User,
          as: "owner",
          attributes: ["id", "username"],
        },
        {
          model: Product,
          as: "products",
        },
      ],
    });

    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// UPDATE a category → OWNER ONLY
router.put("/:id", validateToken, async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({ error: "Not found" });
    }

    if (category.user_id !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const category_name = (req.body.category_name || "").trim();

    if (!category_name) {
      return res.status(400).json({ error: "category_name is required" });
    }

    await category.update({ category_name });

    const updated = await Category.findOne({
      where: { id: category.id },
      include: [
        {
          model: User,
          as: "owner",
          attributes: ["id", "username"],
        },
        {
          model: Product,
          as: "products",
        },
      ],
    });

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH a category → OWNER ONLY (alias for PUT)
router.patch("/:id", validateToken, async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({ error: "Not found" });
    }

    if (category.user_id !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const category_name = (req.body.category_name || "").trim();

    if (!category_name) {
      return res.status(400).json({ error: "category_name is required" });
    }

    await category.update({ category_name });

    const updated = await Category.findOne({
      where: { id: category.id },
      include: [
        {
          model: User,
          as: "owner",
          attributes: ["id", "username"],
        },
        {
          model: Product,
          as: "products",
        },
      ],
    });

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE a category → OWNER ONLY
router.delete("/:id", validateToken, async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({ error: "Not found" });
    }

    if (category.user_id !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await category.destroy();
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;