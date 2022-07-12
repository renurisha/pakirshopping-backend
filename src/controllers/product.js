const express = require("express");
const Product = require("../models/product");
const category = require("../models/category");
const slugify = require("slugify");
const { adminMiddleware } = require("./middlewares");
const { tokenVerify } = require("./middlewares");
const multer = require("multer");
const shortid = require("shortid");
const path = require("path");

const router = express.Router();
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(path.dirname(__dirname), "uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, shortid.generate() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

router.get("/product", async (req, res) => {
  const product = await Product.find();
  if (!product) {
    return res.send("this product is not founded");
  } else {
    return res.send({
      message: "successfully",
      product: product,
    });
  }
});

router.post(
  "/product",
  tokenVerify,
  adminMiddleware,
  upload.array("pictures"),
  async (req, res) => {
    const {
      name,
      price,
      description,

      category,
      quantity,
      reviews,
      category_name,

      createdBy,
    } = req.body;
    let files = [];
    if (req.files.length > 0) {
      files = req.files.map((file) => {
        return { img: file.filename };
      });
    }
    const product = new Product({
      name,
      slug: slugify(req.body.name),
      category_name,
      category,
      description,
      quantity,
      price,
      reviews,
      pictures: files,
      createdBy: req.user._id,
    });
    const prod = await product.save();

    res.send({ message: "product created successfully", product: prod });
  }
);

router.get("/data/alldata", async (req, res) => {
  const cat = await category.find();
  const product = await Product.find();
  res.status(201).send({ category: cat, product: product });
});

module.exports = router;
