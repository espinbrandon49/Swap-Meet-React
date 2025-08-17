const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../models');

// be sure to include its associated Product data
// GET / api / tags → get all tags
router.get('/', async (req, res) => {
  try {
    const tagData = await Tag.findAll({
      include: [{ model: Product }]
    });
    const tags = tagData.map((tag) => tag.get({ plain: true }))
    res.status(200).json(tagData)
  } catch (err) {
    res.status(500).json(err)
  }
});

// be sure to include its associated Product data
// GET / api / tags / :id → get tag by id with products
router.get('/:id', async (req, res) => {
  try {
    const tagData = await Tag.findByPk(req.params.id, {
      include: [{ model: Product }]
    });

    if (!tagData) {
      res.status(404).json({ message: 'No tag found with this id!' })
      return;
    }
    res.status(200).json(tagData)
  } catch (err) {
    res.status(500).json(err);
  }
});

// POST / api / tags → create a tag
router.post('/', async (req, res) => {
  try {
    const tagData = await Tag.create(req.body)
    res.status(200).json(tagData)
  } catch (err) {
    res.status(400).json(err)
  }
});

// PUT / api / tags / :id → update a tag
router.put('/:id', async (req, res) => {
  try {
    const tagData = await Tag.update(
      {
        tag_name: req.body.tag_name
      },
      {
        where: {
          id: req.params.id
        }
      }
    )
    res.status(200).json(tagData)
  } catch (err) {
    res.status(400).json(err)
  }
});

// DELETE / api / tags / :id → delete a tag
router.delete('/:id', async (req, res) => {
  try {
    const tagData = await Tag.destroy({
      where: {
        id: req.params.id
      }
    })

    if (!tagData) {
      res.status(404).json({ message: 'There is no tag with this id!' })
      return 
    }
    res.status(200).json(tagData)
  } catch (err) {
    res.status(500).json(err)
  }
});

module.exports = router;