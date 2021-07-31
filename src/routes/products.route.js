const express = require("express");
const mongoose = require("mongoose");

const { Product } = require("../models/product");
const { Category } = require("../models/category");

const router = express.Router();

// http://localhost:3000/api/products
router.get("/", async (req, res) => {
  let filter = {};
    if(req.query.categories)
    {
         filter = {category: req.query.categories.split(',')}
    }

    const productList = await Product.find(filter).populate('category');

    if(!productList) {
        res.status(500).json({success: false})
    } 
  res.json(productList);
});

router.get(`/:id`, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send("Sản phẩm không tồn tại");
  }

  const product = await Product.findById(req.params.id).populate("category");

  if (!product) {
    res.status(500).json({ success: false });
  }
  res.json(product);
});

router.post("/", async (req, res) => {
  const { name, photo, category, originPrice, sellingPrice, countInStock } =
    req.body;

  const checkCat = await Category.findById(category);
  if (!checkCat)
    return res.status(400).json("Vui lòng chọn loại sản phẩm hợp lệ");

  let product = new Product({
    name,
    photo,
    category,
    originPrice,
    sellingPrice,
    countInStock,
  });

  product = await product.save();

  if (!product) return res.status(500).send("Không thể thêm sản phẩm mới");

  res.json(product);
});

router.put("/:id", async (req, res) => {
  const { name, photo, category, originPrice, sellingPrice, countInStock } =
    req.body;
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send("Mã sản phẩm không hợp lệ");
  }
  const checkCat = await Category.findById(category);
  if (!checkCat)
    return res.status(400).json("Vui lòng chọn loại sản phẩm hợp lệ");

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name,
      photo,
      category,
      originPrice,
      sellingPrice,
      countInStock,
    },
    { new: true }
  );

  if (!product) return res.status(500).send("Không cập nhật được sản phẩm");

  res.json(product);
});

router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).send("Mã sản phẩm không hợp lệ");
    }
    const product = await Product.findByIdAndRemove(req.params.id);
    if (product) {
      return res
        .status(200)
        .json({ success: true, message: `Đã xóa ${product.name} thành công!` });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "Sản phẩm không tồn lại" });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err });
  }
});

router.get(`/get/count`, async (req, res) =>{
  const productCount = await Product.countDocuments((count) => count)

  if(!productCount) {
      res.status(500).json({success: false})
  } 
  res.json({
      productCount: productCount
  });
})

module.exports = router;
