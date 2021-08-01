const express = require("express");
const mongoose = require("mongoose");

const { Bill } = require("../models/bill");
const { BillDetail } = require("../models/billdetail");

const router = express.Router();

router.get(`/`, async (req, res) => {
  const orderList = await Bill.find()
    .populate("user", "name")
    .sort({ createdAt: -1 });

  if (!orderList) {
    res.status(500).json({ success: false });
  }
  res.send(orderList);
});

router.get(`/:id`, async (req, res) =>{
  const bill = await Bill.findById(req.params.id)
  .populate('user', 'name')
  .populate({ 
      path: 'detailItems', populate: {
          path : 'product', populate: 'category'} 
      });

  if(!bill) {
      res.status(500).json({success: false})
  }
  res.send(bill);
})

router.post("/", async (req, res) => {
  const { billDetails, user, customer } = req.body;

  const billDetailIds = Promise.all(
    billDetails.map(async (billDetail) => {
      let newBillDetail = new BillDetail({
        quantity: billDetail.quantity,
        product: billDetail.product,
      });

      newBillDetail = await newBillDetail.save();

      return newBillDetail._id;
    })
  );
  const billDetailResolved = await billDetailIds;
  const totalPrices = await Promise.all(
    billDetailResolved.map(async (billDetailId) => {
      const billDetail = await BillDetail.findById(billDetailId).populate(
        "product",
        "sellingPrice"
      );
      const totalPrice = billDetail.product.sellingPrice * billDetail.quantity;
      return totalPrice;
    })
  );

  const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

  let bill = new Bill({
    detailItems: billDetailResolved,
    customer,
    user,
    totalPrice: totalPrice,
  });
  bill = await bill.save();

  if (!bill) return res.status(404).send("Không thể tạo đơn hàng!");

  res.send(bill);
});

module.exports = router;
