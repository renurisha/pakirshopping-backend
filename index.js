const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const app = express();
require("./src/db/conn");
const cors = require("cors");
const userRoute = require("./src/controllers/user");
// const adminRoute = require("./src/controllers/admin");
const categoryRoute = require("./src/controllers/category");

const productRoute = require("./src/controllers/product");
const cartRoute = require("./src/controllers/cart");
const port = process.env.PORT || 5000;
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cors());
app.use("/api", userRoute);
// app.use("/api", adminRoute);
app.use("/api", categoryRoute);
app.use("/api", productRoute);
app.use("/api", cartRoute);

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
