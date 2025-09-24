const router = require('express').Router();
const { Category, Product, Tag } = require('../models');
const { validateToken } = require('../middleWares/AuthMiddlewares');

// GET all categories (with products + tags) → GLOBAL
router.get('/', async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: [
        {
          model: Product,
          as: 'products',
          include: [{ model: Tag, as: 'tags' }]
        }
      ],
    });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single category by id (with products + tags) → GLOBAL
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: Product,
          as: 'products',
          include: [{ model: Tag, as: 'tags' }]
        }
      ],
    });
    if (!category) return res.status(404).json({ message: 'Not found' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE a category → OWNER ONLY
router.post('/', validateToken, async (req, res) => {
  try {
    const category = await Category.create({
      category_name: req.body.category_name,
      user_id: req.user.id,
    });
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// UPDATE a category → OWNER ONLY
router.put('/:id', validateToken, async (req, res) => {
  try {
    const [updated] = await Category.update(
      { category_name: req.body.category_name },
      { where: { id: req.params.id, user_id: req.user.id } }
    );
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json({ id: req.params.id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE a category → OWNER ONLY
router.delete('/:id', validateToken, async (req, res) => {
  try {
    const deleted = await Category.destroy({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
