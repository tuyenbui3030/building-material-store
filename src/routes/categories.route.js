const express = require("express");
const mongoose = require("mongoose");

const { Category } = require("../models/category");

const router = express.Router();

// http://localhost:3000/api/products
router.get("/", async (req, res) => {
  try {
    const categoryAll = await Category.find();
    if (!categoryAll) {
      res.status(500).json({ success: false });
    }
    res.status(200).json(categoryAll);
  } catch (err) {
    return res.status(500).json({ success: false, error: err });
  }
});

router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).send("Loại sản phẩm không tồn tại");
    }
    const category = await Category.findById(req.params.id);

    if (!category) {
      res
        .status(500)
        .json({ message: "The category with the given ID was not found." });
    }
    res.status(200).json(category);
  } catch (err) {
    return res.status(500).json({ success: false, error: err });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name } = req.body;
    let category = new Category({
      name,
    });
    category = await category.save();

    if (!category)
      return res.status(404).send("Không thể tạo mới loại sản phẩm!");

    res.json(category);
  } catch (err) {
    return res.status(500).json({ success: false, error: err });
  }
});

router.put("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).send("Loại sản phẩm không tồn tại");
    }
    const { name } = req.body;

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      {
        name,
      },
      { new: true }
    );

    if (!category) return res.status(400).send("Loại sản phẩm không tồn tại");

    res.send(category);
  } catch (err) {
    return res.status(500).json({ success: false, error: err });
  }
});

router.delete("/:id", (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send("Loại sản phẩm không tồn tại");
  }
  Category.findByIdAndRemove(req.params.id)
    .then((category) => {
      if (category) {
        return res.status(200).json({
          success: true,
          message: `Đã xóa ${category.name} khỏi danh sách loại sản phẩm`,
        });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "Loại sản phẩm không tồn tại" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ success: false, error: err });
    });
});
module.exports = router;
