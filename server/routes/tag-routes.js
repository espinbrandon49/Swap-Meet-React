const router = require('express').Router();
const { Op } = require('sequelize');
const { Tag } = require('../models');
const { validateToken } = require('../middleWares/AuthMiddlewares');

// GET /api/tags
router.get('/', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    let { limit = 100, offset = 0 } = req.query;

    // Clamp pagination (0..100 for limit, >= 0 for offset)
    const limitNum = Math.max(0, Math.min(parseInt(limit, 10) || 100, 100));
    const offsetNum = Math.max(0, parseInt(offset, 10) || 0);

    const where = q ? { tag_name: { [Op.like]: `%${q}%` } } : undefined;

    const tags = await Tag.findAll({
      where,
      limit: limitNum,
      offset: offsetNum,
      order: [['tag_name', 'ASC']],
    });

    res.json(tags);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET /api/tags/:id
router.get('/:id', async (req, res) => {
  try {
    const tag = await Tag.findByPk(req.params.id);
    if (!tag) return res.status(404).json({ message: 'Not found' });
    res.json(tag);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tags
router.post('/', validateToken, async (req, res) => {
  try {
    const raw = (req.body.tag_name || '').trim();
    if (!raw) return res.status(400).json({ error: 'tag_name is required' });

    const tag_name = raw.toLowerCase();

    const created = await Tag.create({ tag_name });
    res.status(201).json(created);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Tag already exists' });
    }
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: err.errors?.[0]?.message || 'Validation failed' });
    }
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
