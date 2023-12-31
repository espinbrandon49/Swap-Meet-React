const router = require('express').Router();
const { Category, Product, Tag } = require('../../models');
const { validateToken } = require('../../middleWares/AuthMiddlewares')

// The `/api/categories` endpoint
// find all categories
// be sure to include its associated Products
router.get('/', async (req, res) => {
  try {
    const categoryData = await Category.findAll({
      include: [{ model: Product }],
    });
    const categories = categoryData.map((category) => category.get({ plain: true }))
    res.status(200).json(categoryData)
  } catch (err) {
    res.status(500).json(err)
  }
});

// find one category by its `id` value
// be sure to include its associated Products
router.get('/:id', async (req, res) => {
  try {
    const categoryData = await Category.findByPk(req.params.id, {
      include: [{ model: Product }]
    });

    if (!categoryData) {
      res.status(404).json({ message: 'No category found with this id!' });
      return;
    }
    res.status(200).json(categoryData)
  } catch (err) {
    res.status(500).json(err);
  }
});

// get categories by user id
router.get('/byuserId/:id', async (req, res) => {
  const id = req.params.id;
  const listOfCategories = await Category.findAll({ where: { userId: id } });
  res.json(listOfCategories)
})

router.post('/', validateToken, async (req, res) => {
  try {
    const category = req.body;
    category.userId = req.user.id
    await Category.create(category)

    const tagName = {
      tag_name: req.body.category_name,
    }
    await Tag.create(tagName)
    res.status(200).json(category)
  } catch (err) {
    res.status(400).json(err)
  }
});

// update a category by its `id` value
router.put('/categoryName', validateToken, async (req, res) => {
  try {
    const { newCategoryName, id, pid } = req.body;
    await Category.update(
      { category_name: newCategoryName },
      { where: { id: id } }
    );
    await Product.update(
      { categoryName: newCategoryName },
      { where: { id: pid } }
    )
    res.status(200).json(newCategoryName)
  } catch (err) {
    res.status(400).json(err)
  }
});

// delete a category by its `id` value
router.delete('/:id', async (req, res) => {
  try {
    const categoryData = await Category.destroy({
      where: {
        id: req.params.id
      }
    });

    if (!categoryData) {
      res.status(404).json({ message: 'The is no category with this id!' });
      return;
    }

    res.status(200).json(categoryData);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
