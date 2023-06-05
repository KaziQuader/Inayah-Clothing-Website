const Order = require("../models/orderModel");
const Product = require("../models/productModel");

//  Create New Order
exports.newOrder = async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    itemPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  const order = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    itemPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paidAt: Date.now(),
    user: req.user._id,
  });

  res.status(201).json({
    success: true,
    order,
  });
};

// Get Logged in user Order
exports.myOrders = async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id });

  res.status(200).json({
    success: true,
    orders,
  });
};

// Get Single Order
exports.getSingleOrder = async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!order) {
    res.status(404).json({
      success: false,
      message: "Order not found",
    });
  }

  res.status(200).json({
    success: true,
    order,
  });
};

// Get All Order -- Admin
exports.getAllOrders = async (req, res, next) => {
  const orders = await Order.find();

  let totalAmount = 0;

  orders.forEach((order) => {
    totalAmount += order.totalPrice;
  });

  res.status(200).json({
    success: true,
    orders,
    totalAmount,
  });
};

// Update Order Status -- Admin
exports.updateOrder = async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404).json({
      success: false,
      message: "Order not found",
    });
  }

  if (order.orderStatus === "Delivered") {
    return next("You have delivered this Order", 404);
  }

  order.orderItems.forEach(async (ord) => {
    await updateStock(ord.product, ord.quantity);
  });

  order.orderStatus = req.body.status;

  if (req.body.status === "Delivered") {
    order.deliveredAt = Date.now();
  }

  await order.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
};

async function updateStock(id, quantity) {
  const product = await Product.findById(id);

  product.Stock -= quantity;
  await product.save({ validateBeforeSave: false });
}

// Delete-- Admin
exports.deleteOrder = async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404).json({
      success: false,
      message: "Order not found",
    });
  }

  await order.deleteOne();

  res.status(200).json({
    success: true,
  });
};
