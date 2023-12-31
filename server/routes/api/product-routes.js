const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');
const multer = require('multer');
const path = require('path');
const { validateToken } = require('../../middleWares/AuthMiddlewares');
const ProductCart = require('../../models/ProductCart')

// The `/api/products` endpoint
// get all products
// find all products
// be sure to include its associated Category and Tag data
router.get('/', async (req, res) => {
  try {
    const productData = await Product.findAll({
      include: [{ model: Category }, { model: Tag }],
    });
    const products = productData.map((product) => product.get({
      plain: true
    }))
    res.status(200).json(productData)
  } catch (err) {
    res.status(500).json(err)
  }
});

// get one product
router.get('/:category_id', async (req, res) => {
  try {
    const category_id = req.params.category_id
    const products = await Product.findAll({ where: { category_id: category_id } });

    if (!products) {
      res.status(404).json({ message: 'No product found with this id!' })
      return;
    }

    res.status(200).json(products)
  } catch (err) {
    res.status(500).json(err)
  }
});

//get products by user id
router.get('/productbyuserId/:id', async (req, res) => {
  const id = req.params.id;
  const listOfProducts = await Product.findAll({ where: { userId: id } });
  res.json(listOfProducts)
})

// UPLOAD IMAGE // UPLOAD IMAGE // UPLOAD IMAGE // UPLOAD IMAGE
const storage = multer.diskStorage({
  destination: './public',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + file.originalname.replace(/\s/g, '').toLowerCase());
  }
})

const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000000 },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb)
  }
}).single('image')

//Check file type
function checkFileType(file, cb) {
  //Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  //Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
  //Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true)
  } else {
    cb("Error: Images Only!")
  }
}

router.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      return res.send({
        msg: err
      });
    } else {
      console.log(req.file)

      if (req.file === undefined) {
        res.send({
          msg: 'Error: No File Selected'
        });
      } else {
        return res.send(`https://swapmeetreact-4f408e945efe.herokuapp.com/public/${req.file.filename}`)
      }
    }
  });
});

// create new product
router.post('/', validateToken, (req, res) => {
  //req.body should look like this...
  // let newProduct = {
  //   image: req.body.image,
  //   product_name: req.body.product_name,
  //   username: req.body.username,
  //   price: req.body.price,
  //   stock: req.body.stock,
  //   categoryName: req.body.categoryName,
  //   category_id: req.body.category_id,
  //   userId: req.body.userId,
  //   tagIds: req.body.tagIds
  // }

  Product.create(req.body)
    .then((product) => {
      if (req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr);
      }
      res.status(200).json(product);
    })
    .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// delete one product by its `id` value
router.delete('/:id', async (req, res) => {
  try {
    const productData = await Product.destroy({
      where: {
        id: req.params.id
      }
    });

    if (!productData) {
      res.status(404).json({ message: 'No product found with this id' });
      return
    }

    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.put('/productName', validateToken, async (req, res) => {
  try {
    const { newProductName, id } = req.body;
    await Product.update(
      { product_name: newProductName },
      { where: { id: id } }
    );
    res.status(200).json(newProductName)
  } catch (err) {
    res.status(400).json(err)
  }
})

router.put('/stock', validateToken, async (req, res) => {
  try {
    const { newStock, id } = req.body;
    await Product.update(
      { stock: newStock },
      { where: { id: id } }
    );
    res.status(200).json(newStock)
  } catch (err) {
    res.status(400).json(err)
  }
})

router.put('/productPrice', validateToken, async (req, res) => {
  try {
    const { newProductPrice, id } = req.body;
    await Product.update(
      { price: newProductPrice },
      { where: { id: id } }
    );
    res.status(200).json(newProductPrice)
  } catch (err) {
    res.status(400).json(err)
  }
})

router.post('/addtocart', validateToken, (req, res) => {
  Product.findByPk(req.body.pid)
    .then((product) => {
      const product_id = product.id
      const cart_id = req.user.id
      ProductCart.create({ product_id: product_id, cart_id: cart_id })

      res.status(200).json(product);
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

//remove from cart
router.post('/removefromcart', (req, res) => {
  Product.findByPk(req.body.pid)
    .then((product) => {
      ProductCart.destroy({ where: { id: req.body.cid } })
      res.status(200).json(product);
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

module.exports = router;