import asyncHandler from '../utils/asyncHandler.js';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';

export const placeOrder = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user._id }).populate('products.productId');

  if (!cart || cart.products.length === 0) {
    return res.status(400).json({ success: false, message: 'Cart is empty' });
  }

  const items = cart.products
    .filter((item) => item.productId)
    .map((item) => ({
      productId: item.productId._id,
      productName: item.productId.productName,
      price: item.productId.price,
      quantity: item.quantity,
    }));

  if (items.length === 0) {
    return res.status(400).json({ success: false, message: 'No valid products in cart' });
  }

  const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const order = await Order.create({
    userId: req.user._id,
    products: items,
    totalAmount,
    status: 'Pending',
  });

  // Snapshot prices are stored on the order; clear the live cart after checkout.
  cart.products = [];
  await cart.save();

  res.status(201).json(order);
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate('userId', 'name email')
    .sort({ createdAt: -1 });
  res.json(orders);
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ['Pending', 'Processing', 'Shipped', 'Delivered'];

  if (!allowed.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status value' });
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  order.status = status;
  const updated = await order.save();
  res.json(updated);
});
