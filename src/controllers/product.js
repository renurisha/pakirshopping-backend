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

router.get("/product/sorting", async (req, res) => {
  const page = parseInt(req.query.page) - 1 || 0;
  const limit = parseInt(req.query.limit) || 5;
  const search = req.query.search || "";
  let sort = req.query.sort || "price";
  req.query.sort ? (sort = req.query.sort.split(",")) : (sort = [sort]);
  let sortBy = {};
  if (sort[1]) {
    sortBy[sort[0]] = sort[1];
  } else {
    sortBy[sort[0]] = "asc";
  }
  //const cat = await category.find();
  const product = await Product.find()
    .sort(sortBy)
    .skip(page * limit)
    .limit(limit);
  res
    .status(201)
    .send({ page: page + 1, limit: limit, sortBy, product: product });
});

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

router.delete("/product/:id", async (req, res) => {
  Product.findByIdAndDelete(req.params.id).then(() => {
    return res.send({ message: "product deleted successfully" }).catch(() => {
      return res.send({
        message: "something went wrong....",
      });
    });
  });
});
router.get("/product/details/:id", async (req, res) => {
  const product = await Product.findById({ _id: req.params.id });
  if (!product) {
    return res.send("this product is not founded");
  } else {
    return res.status(201).send({
      message: "successfully",
      product: product,
    });
  }
  return res.status(401).send({
    message: "product Not found..",
  });
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
      review,
      category_name,
      rating,

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
      rating,
      review,
      pictures: files,
      createdBy: req.user._id,
    });
    const prod = await product.save();

    res.send({ message: "product created successfully", product: prod });
  }
);

router.get("/data/alldata", async (req, res) => {
  const search = req.query.search;
  if (search) {
    const cat = await category.find();
    const product = await Product.find({
      name: { $regex: search, $options: "i" },
    });
    res.status(201).send({ category: cat, product: product });
  } else {
    const cat = await category.find();
    const product = await Product.find();
    res.status(201).send({ category: cat, product: product });
  }
});
router.get(`/product/:slug`, async (req, res) => {
  const { slug } = req.params;
  const page = parseInt(req.query.page) - 1 || 0;
  const limit = parseInt(req.query.limit) || 50;
  const search = req.query.search || "";
  //let sort = req.query.sort || "price";
  let sort;
  console.log("sortby....", req.query.sort, req.query.orderBy);
  // req.query.sort ? (sort = req.query.sort.split(",")) : (sort = [sort]);

  let sortBy = {};
  if (req.query.sort) {
    sort = req.query.sort;
    if (req.query.orderBy) {
      sortBy[sort] = req.query.orderBy;
    } else {
      sortBy[sort] = "asc";
    }
  } else {
    sortBy = {};
  }
  // let sortBy = {};
  // if (sort[1]) {
  //   sortBy[sort[0]] = sort[1];
  // } else {
  //   sortBy[sort[0]] = "asc";
  // }
  const cat = await category.findOne({ slug: slug });
  if (!cat) {
    return res.status(401).send({ message: "invalid category of products" });
  } else {
    const product = await Product.find({ category: cat._id })
      .sort(sortBy)
      .skip(page * limit)
      .limit(limit);
    return res.status(201).send({
      product: product,
      productByPrice: {
        under10k: product.filter((p) => p.price <= 10000),
        under20k: product.filter((p) => p.price > 10000 && p.price <= 20000),
        under30k: product.filter((p) => p.price > 20000 && p.price <= 30000),
        above30k: product.filter((p) => p.price > 30000),
      },
    });
  }
});

router.get(`/product/getimage/:path`, (req, res) => {
  res.download("./src/uploads/" + req.params.path);
});
module.exports = router;
