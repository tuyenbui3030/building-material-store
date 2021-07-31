const Mongoose = require("mongoose");
const mongodb = {
  host: "localhost",
  port: 27017,
  name: "building-material",
  username: "admin",
  password: "admin",
};

Mongoose.connect(
  `mongodb://${mongodb.username}:${mongodb.password}@${mongodb.host}:${mongodb.port}/${mongodb.name}?authSource=admin`,
  {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  }
)
  .then(() => {
    console.log("Database connecting!");
  })
  .catch((err) => {
    console.log(`[ERROR] ${err}`);
  });

module.exports = Mongoose;
