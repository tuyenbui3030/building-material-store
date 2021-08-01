const mongoose = require("mongoose");

const billDetailSchema = mongoose.Schema(
  {
    quantity: {
      type: Number,
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  },
  {
    timestamps: true,
  }
);

exports.BillDetail = mongoose.model("BillDetail", billDetailSchema);
