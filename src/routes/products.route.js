const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");

const { Product } = require("../models/product");
const { Category } = require("../models/category");
const { Receive } = require("../models/receive");

const router = express.Router();

const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("Hình ảnh không hợp lệ!");

    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, "src/public/uploads");
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(" ").join("-");
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

const uploadOptions = multer({ storage: storage });

router.get("/", async (req, res) => {
  let filter = {};
  if (req.query.categories) {
    filter = { category: req.query.categories.split(",") };
  }

  const productList = await Product.find(filter).populate("category");

  if (!productList) {
    res.status(500).json({ success: false });
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

router.post("/", uploadOptions.single("photo"), async (req, res) => {
  const { name, category, originPrice, sellingPrice, countInStock } = req.body;

  const file = req.file;
  if (!file) return res.status(400).send("Thiếu hình ảnh sản phẩm");

  const fileName = file.filename;
  const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;

  const checkCat = await Category.findById(category);
  if (!checkCat)
    return res.status(400).json("Vui lòng chọn loại sản phẩm hợp lệ");

  let product = new Product({
    name,
    photo: `${basePath}${fileName}`,
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

//Nhập kho
router.patch("/receive/create", async (req, res) => {
  if (!mongoose.isValidObjectId(req.body.product)) {
    return res.status(400).send("Mã sản phẩm không hợp lệ");
  }

  const product = await Product.findByIdAndUpdate(
    req.body.product,
    { $inc: { countInStock: req.body.quantity } },
    { new: true }
  );

  let receive = new Receive({
    product: product._id,
    quantity: req.body.quantity,
  });

  receive = await receive.save();

  if (!product) return res.status(500).send("Không cập nhật được sản phẩm");

  res.json(product);
});

//Chỉnh sửa số lượng nhập kho
router.patch("/receive/:id/edit", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send("Mã đơn nhập kho không hợp lệ");
  }

  const receive = await Receive.findByIdAndUpdate(req.params.id, {
    quantity: req.body.quantity,
  }).populate({path: "product", select: "_id name"});

  if (!receive) return res.status(500).send("Mã đơn nhập không tồn tại");

  const newCountInStock = req.body.quantity - receive.quantity;

  const product = await Product.findByIdAndUpdate(
    receive.product._id,
    { $inc: { countInStock: newCountInStock } },
    { new: true }
  );

  if (!product) return res.status(500).send("Mã sản phẩm không tồn tại");

  res.json(receive);
});

//Lấy danh sách nhập kho
router.get("/receive", async (req, res) => {
  const receiveList = await Receive.find().populate("product");

  if (!receiveList) {
    res.status(500).json({ success: false });
  }
  res.json(receiveList);
});

//Xóa sản phẩm
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

router.get(`/get/count`, async (req, res) => {
  const productCount = await Product.countDocuments((count) => count);

  if (!productCount) {
    res.status(500).json({ success: false });
  }
  res.json({
    productCount: productCount,
  });
});

module.exports = router;
