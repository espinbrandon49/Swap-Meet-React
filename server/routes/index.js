const router = require('express').Router();

const userRoutes = require("./user-routes")
const productRoutes = require("./product-routes")
const categoryRoutes = require("./category-routes")
const tagRoutes = require("./tag-routes")
const cartRoutes = require("./cart-routes")

router.use("/users", userRoutes)
router.use("/products", productRoutes)
router.use("/categories", categoryRoutes)
router.use("/tags", tagRoutes)
router.use("/cart", cartRoutes)

router.use((req, res) => {
  res.status(404).send("<h1>Wrong Route!</h1>");
});

module.exports = router;
