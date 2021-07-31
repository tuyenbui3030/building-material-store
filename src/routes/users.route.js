const express = require("express");
const mongoose = require("mongoose");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { User } = require("../models/user");

const router = express.Router();

// http://localhost:3000/api/products
router.get("/", async (req, res) => {
  const userAll = await User.find().select("-password");
  if (!userAll) {
    res.status(500).json({ success: false });
  }
  res.json(userAll);
});

router.get("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send("Người dùng không tồn tại");
  }
  const user = await User.findById(req.params.id).select("-password");

  if (!user) {
    res
      .status(500)
      .json({ message: "The user with the given ID was not found." });
  }
  res.status(200).send(user);
});

router.post("/register", async (req, res) => {
  const { name, phone, password } = req.body;
  let checkPhone = await User.findOne({ phone });
  if (checkPhone) return res.status(400).send("Số điện thoại đã tồn tại");
  let user = new User({
    name,
    phone,
    password: bcrypt.hashSync(password, 10),
    token: crypto.randomBytes(30).toString("hex"),
  });
  user = await user.save();

  if (!user) return res.status(400).send("Tạo mới tài khoản thất bại");

  res.status(200).json(user);
});

router.post("/login", async (req, res) => {
  const { phone, password } = req.body;
  console.table({ phone, password });
  const user = await User.findOne({ phone });
  const secret = process.env.secret;
  if (!user) {
    return res.status(400).json("Người dùng không tồn tại");
  }

  if (user && bcrypt.compareSync(password, user.password)) {
    const token = jwt.sign(
      {
        userId: user.id,
        isAdmin: user.isAdmin,
      },
      secret,
      { expiresIn: "1d" }
    );

    res.status(200).json({ user: user.phone, token: token });
  } else {
    res.status(400).send("password is wrong!");
  }
});

module.exports = router;
