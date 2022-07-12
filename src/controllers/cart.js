const express = require("express");
const Cart = require("../models/cart");
const slugify = require("slugify");
const { userMiddleware } = require("./middlewares");
const { tokenVerify } = require("./middlewares");

const router = express.Router();

router.post("/user/cart/getproduct", async (req, res) => {
  const cat = await Cart.find();
  if (!cat) {
    return res.send("this category is not founded");
  } else {
    const categorylist = findCategoryList(cat);
    return res.send({
      message: "successfully",
      category: categorylist,
    });
  }
});

router.post(
  "/user/cart/product",
  tokenVerify,
  userMiddleware,
  async (req, res) => {
    var finduser = await Cart.findOne({ user: req.user._id });
    if (finduser) {
      console.log(finduser);

      Cart.findOne({
        user: req.user._id,
        "cartItems.product": req.body.cartItems.product,
      }).exec((err, data) => {
        if (err) {
          return res.status(401).send("something went wrong");
        }
        if (data) {
          console.log("data", data);
          var matchdata = data.cartItems.find(
            (e) => e.product == req.body.cartItems.product
          );

          //update quantity...
          Cart.findOneAndUpdate(
            {
              user: req.user._id,
              "cartItems.product": req.body.cartItems.product,
            },
            {
              $set: {
                "cartItems.$": {
                  ...req.body.cartItems,
                  quantity: matchdata.quantity + req.body.cartItems.quantity,
                },
              },
            }
          ).exec((err, q) => {
            if (err) {
              return res.status(401).send("something went wrong");
            }
            if (q) {
              return res
                .status(201)
                .json({ message: "updated quantity", updatedqty: q });
            }
            return res.status(201).json({ message: "quantity not updated.." });
          });
        } else {
          Cart.findOneAndUpdate(
            { user: req.user._id },
            {
              $push: {
                cartItems: req.body.cartItems,
              },
            }
          ).exec((err, data) => {
            if (err) {
              return res.status(401).send("something went wrong");
            }
            if (data) {
              return res.status(201).json({
                message: "added new product to cart",
                addedmorecart: data,
              });
            }
            return res.status(401).send("not updated..");
          });
        }
      });
    } else {
      const cart = new Cart({
        user: req.user._id,
        cartItems: [req.body.cartItems],
      });
      const result = await cart.save();
      return res
        .status(201)
        .send({ message: "cart inserted successfully", cart: result });
    }
  }
);
module.exports = router;

/*

if (findexistcart) {
        Cart.findOneAndUpdate(
          {
            user: req.user._id,
            "cartItems.product": req.body.cartItems.product,
          },
          {
            $push: {
              cartItems: {
                ...req.body.cartItems,
                quantity: findexistcart.quantity + req.body.cartItems.quantity,
              },
            },
          }
        ).exec((err, data) => {
          if (err) {
            return res.status(401).send("something went wrong");
          }
          if (data) {
            return res.status(201).json({ addedmorecart: data });
          }
          return res.status(401).send("not updated..");
        });
      } else {
        Cart.findOneAndUpdate(
          { user: req.user._id },
          {
            $push: {
              cartItems: req.body.cartItems,
            },
          }
        ).exec((err, data) => {
          if (err) {
            return res.status(401).send("something went wrong");
          }
          if (data) {
            return res.status(201).json({ addedmorecart: data });
          }
          return res.status(401).send("not updated..");
        });
      }



 */
