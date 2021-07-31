const express = require("express");
const morgan = require("morgan");
// const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv/config");

require("./database");
const authJwt = require("./helpers/jwt");
const errorHandler = require('./helpers/error-handler');

const app = express();

app.options("*", cors());
app.use(express.json());
app.use(morgan("tiny"));
app.use(authJwt());
app.use(errorHandler);


const api = process.env.API_URL;

const categoriesRoutes = require("./routes/categories.route");
const productsRoutes = require("./routes/products.route");
const usersRoutes = require("./routes/users.route");

app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/products`, productsRoutes);
app.use(`${api}/users`, usersRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running http://localhost:${PORT}`);
});
