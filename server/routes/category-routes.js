const router = require('express').Router();
const { Op } = require('sequelize');
const { Category, Product } = require('../models');
const { validateToken } = require('../middleWares/AuthMiddlewares');

// GET /api/categories - List current user's categories (with products)
router.get('/', validateToken, async (req, res) => {
  try {
    const qRaw = req.query.q || '';
    const q = qRaw.trim();
    let { limit = 100, offset = 0 } = req.query;
    const limitNum = Math.max(0, Math.min(parseInt(limit, 10) || 100, 200));
    const offsetNum = Math.max(0, parseInt(offset, 10) || 0);

    const where = { user_id: req.user.id };
    if (q) where.category_name = { [Op.like]: `%${q}%` };

    const categories = await Category.findAll({
      where,
      include: [{ model: Product }],
      order: [['category_name', 'ASC']],
      limit: limitNum,
      offset: offsetNum,
    });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/categories/:id - Fetch one category (owner-scoped, with products)
router.get('/:id', validateToken, async (req, res) => {
  try {
    const category = await Category.findOne({
      where: { id: req.params.id, user_id: req.user.id },
      include: [{ model: Product }],
    });
    if (!category) return res.status(404).json({ message: 'Not found' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/categories - Create category for current user
router.post('/', validateToken, async (req, res) => {
  try {
    const name = (req.body.category_name || '').trim();
    if (!name) return res.status(400).json({ error: 'category_name is required' });

    const created = await Category.create({ category_name: name, user_id: req.user.id });
    res.status(201).json(created);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Category name already exists for this user' });
    }
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: err.errors?.[0]?.message || 'Validation failed' });
    }
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/categories/:id - Rename category (owner-scoped, unique name)
router.put('/:id', validateToken, async (req, res) => {
  try {
    const name = (req.body.category_name || '').trim();
    if (!name) return res.status(400).json({ error: 'category_name is required' });

    const [count] = await Category.update(
      { category_name: name },
      { where: { id: req.params.id, user_id: req.user.id } }
    );

    if (!count) return res.status(404).json({ message: 'Not found' });
    res.json({ id: req.params.id, category_name: name });
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Category name already exists for this user' });
    }
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: err.errors?.[0]?.message || 'Validation failed' });
    }
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/categories/:id - Delete category (owner-scoped; products cascade via FK)
router.delete('/:id', validateToken, async (req, res) => {
  try {
    const count = await Category.destroy({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!count) return res.status(404).json({ message: 'Not found' });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
