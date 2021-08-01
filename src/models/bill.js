const mongoose = require("mongoose");

const billSchema = mongoose.Schema(
  {
    detailItems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BillDetail",
        required: true,
      },
    ],
    customer: { type: String, default: "Khách vãng lai" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    totalPrice: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

exports.Bill = mongoose.model("Bill", billSchema);
