
const router = require('express').Router();
const { Op } = require('sequelize');
const sequelize = require('../config/connection');
const { Product, Category, Tag, ProductTag } = require('../models');
const { validateToken } = require('../middleWares/AuthMiddlewares');

// Helper: confirm a product belongs to the current user via its Category
async function loadOwnedProduct(id, userId) {
  const prod = await Product.findByPk(id, {
    include: [{ model: Category, attributes: ['id', 'user_id'] }],
  });
  return prod && prod.Category && prod.Category.user_id === userId ? prod : null;
}

// GET /api/products - Owner-scoped list with optional filters
router.get('/', validateToken, async (req, res) => {
  try {
    let { limit = 50, offset = 0, categoryId, tagId } = req.query;

    const limitNum = Math.max(0, Math.min(parseInt(limit, 10) || 50, 100));
    const offsetNum = Math.max(0, parseInt(offset, 10) || 0);

    const where = {};
    if (categoryId !== undefined) {
      const cid = parseInt(categoryId, 10);
      if (Number.isInteger(cid)) where.category_id = cid;
    }

    const include = [{ model: Category, where: { user_id: req.user.id } }];
    if (tagId !== undefined) {
      const tid = parseInt(tagId, 10);
      if (Number.isInteger(tid)) {
        include.push({ model: Tag, where: { id: tid } });
      } else {
        include.push({ model: Tag });
      }
    } else {
      include.push({ model: Tag });
    }

    const rows = await Product.findAll({
      where,
      include,
      limit: limitNum,
      offset: offsetNum,
      distinct: true,
      subQuery: false,
    });

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/by-category/:category_id
// Verify the category belongs to the user, then list products under it
router.get('/by-category/:category_id', validateToken, async (req, res) => {
  try {
    const category = await Category.findOne({
      where: { id: req.params.category_id, user_id: req.user.id },
    });
    if (!category) return res.status(404).json({ message: 'Category not found' });

    const products = await Product.findAll({
      where: { category_id: category.id },
      include: [{ model: Tag }],
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products
// Guard by category ownership; optional tagIds[]
router.post('/', validateToken, async (req, res) => {
  try {
    // Pull + normalize inputs
    let { product_name, price, stock, image_url, category_id, tagIds = [] } = req.body;
    product_name = (product_name || '').trim();
    image_url = (image_url || '').trim();
    category_id = Number(category_id);

    if (!product_name) return res.status(400).json({ error: 'product_name is required' });
    if (!Number.isInteger(category_id)) return res.status(400).json({ error: 'category_id must be an integer' });

    // Ownership guard: category must belong to the caller
    const cat = await Category.findOne({ where: { id: category_id, user_id: req.user.id } });
    if (!cat) return res.status(403).json({ error: 'Forbidden' });

    // Normalize tagIds
    tagIds = Array.isArray(tagIds)
      ? [...new Set(tagIds.map(Number).filter(Number.isInteger))]
      : [];

    // Pre-validate tag existence
    if (tagIds.length) {
      const count = await Tag.count({ where: { id: { [Op.in]: tagIds } } });
      if (count !== tagIds.length) {
        return res.status(422).json({ error: 'One or more tagIds do not exist' });
      }
    }

    // Transaction for atomicity (product + tag attaches)
    const t = await sequelize.transaction();
    try {
      const product = await Product.create(
        { product_name, price, stock, image_url, category_id },
        { transaction: t }
      );

      if (tagIds.length) {
        const rows = tagIds.map(tag_id => ({ product_id: product.id, tag_id }));
        await ProductTag.bulkCreate(rows, { transaction: t });
      }

      await t.commit();
      return res.status(201).json(product);
    } catch (err) {
      await t.rollback();
      const status = /unique/i.test(err.message) ? 409 : 400;
      return res.status(status).json({ error: err.message });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// PATCH /api/products/:id
router.patch('/:id', validateToken, async (req, res) => {
  try {
    const prod = await loadOwnedProduct(req.params.id, req.user.id);
    if (!prod) return res.status(404).json({ message: 'Not found' });

    const data = {};
    if (Object.prototype.hasOwnProperty.call(req.body, 'product_name')) {
      const v = req.body.product_name;
      if (typeof v === 'string') data.product_name = v.trim();
    }
    if (Object.prototype.hasOwnProperty.call(req.body, 'image_url')) {
      const v = req.body.image_url;
      if (typeof v === 'string') data.image_url = v.trim();
    }
    if (Object.prototype.hasOwnProperty.call(req.body, 'price')) data.price = req.body.price;
    if (Object.prototype.hasOwnProperty.call(req.body, 'stock')) data.stock = req.body.stock;

    await prod.update(data);
    res.json({ id: prod.id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/products/:id
// Owner-guarded delete
router.delete('/:id', validateToken, async (req, res) => {
  try {
    const prod = await loadOwnedProduct(req.params.id, req.user.id);
    if (!prod) return res.status(404).json({ message: 'Not found' });

    await Product.destroy({ where: { id: prod.id } });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
