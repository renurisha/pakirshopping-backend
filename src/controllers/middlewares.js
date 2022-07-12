const User = require("../models/user");
const jwt = require("jsonwebtoken");
exports.tokenVerify = async (req, res, next) => {
  const authdata = req.headers.authorization.split(" ")[1];
  const user = jwt.verify(authdata, process.env.SECRET_KEY);
  if (!user) {
    return res.status(401).send("invalid user....");
  }

  const searchuser = await User.findById(user._id);

  req.user = searchuser;
  console.log("userverify", req.user);
  console.log("userverify", req.user.role);
  next();
};
exports.adminMiddleware = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.send({ message: "Access Denied" });
  }
  next();
};
exports.userMiddleware = (req, res, next) => {
  if (req.user.role !== "user") {
    return res.send({ message: "Access Denied" });
  }
  next();
};
