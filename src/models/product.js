const mongoose = require("mongoose");

const productSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    photo: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    originPrice: { type: Number, min: 0, required: true },
    sellingPrice: { type: Number, min: 0, required: true },
    countInStock: { type: Number, min: 0, required: true },
  },
  {
    timestamps: true,
  }
);

// productSchema.virtual("id").get(function () {
//   return this._id.toHexString();
// });

// productSchema.set("toJSON", {
//   virtuals: true,
// });

exports.Product = mongoose.model("Product", productSchema);
