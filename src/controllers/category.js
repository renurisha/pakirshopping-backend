const express = require("express");
const category = require("../models/category");
const slugify = require("slugify");
const { adminMiddleware } = require("./middlewares");
const { tokenVerify } = require("./middlewares");

const router = express.Router();

const findCategoryList = (category, parentId = null) => {
  const list = [];
  let cat;
  if (parentId == null) {
    cat = category.filter((c) => c.parentId == undefined);
  } else {
    cat = category.filter((c) => c.parentId == parentId);
  }
  for (let k of cat) {
    list.push({
      _id: k._id,
      name: k.name,
      slug: k.slug,
      children: findCategoryList(category, k._id),
    });
  }
  return list;
};
router.get("/category/getcategory", async (req, res) => {
  const cat = await category.find();
  if (!cat) {
    return res.status(401).send({ message: "this category is not founded" });
  } else {
    const categorylist = findCategoryList(cat);
    return res.status(201).send({
      message: "successfully find category...",
      category: categorylist,
    });
  }
});

router.post(
  "/category/addcategory",
  tokenVerify,
  adminMiddleware,
  (req, res) => {
    const obj = {
      name: req.body.name,
      slug: slugify(req.body.name),
    };
    if (req.body.parentId) {
      obj.parentId = req.body.parentId;
    }
    const cat = new category(obj);
    cat.save((err, categoty) => {
      if (err) {
        return res.status(401).json({ err });
      }
      if (category) {
        return res
          .status(201)
          .json({ message: "category created successfully..", category: cat });
      }
    });
  }
);
module.exports = router;
