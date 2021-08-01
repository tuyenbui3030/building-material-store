const mongoose = require("mongoose");

const receiveSchema = mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

exports.Receive = mongoose.model("Receive", receiveSchema);
