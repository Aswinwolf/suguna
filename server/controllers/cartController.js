import asyncHandler from '../utils/asyncHandler.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

const populatedCart = (userId) =>
  Cart.findOne({ userId }).populate('products.productId');

export const getCart = asyncHandler(async (req, res) => {
  let cart = await populatedCart(req.user._id);
  if (!cart) cart = await Cart.create({ userId: req.user._id, products: [] });
  res.json(cart);
});

export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  let cart = await Cart.findOne({ userId: req.user._id });
  if (!cart) cart = await Cart.create({ userId: req.user._id, products: [] });

  const item = cart.products.find((p) => p.productId.toString() === productId);
  if (item) {
    item.quantity += Number(quantity);
  } else {
    cart.products.push({ productId, quantity: Number(quantity) });
  }

  await cart.save();
  res.status(201).json(await populatedCart(req.user._id));
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ userId: req.user._id });
  if (!cart) {
    return res.status(404).json({ success: false, message: 'Cart not found' });
  }

  const item = cart.products.find((p) => p.productId.toString() === req.params.productId);
  if (!item) {
    return res.status(404).json({ success: false, message: 'Item not in cart' });
  }

  if (Number(quantity) < 1) {
    return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
  }

  item.quantity = Number(quantity);
  await cart.save();
  res.json(await populatedCart(req.user._id));
});

export const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user._id });
  if (!cart) {
    return res.status(404).json({ success: false, message: 'Cart not found' });
  }

  cart.products = cart.products.filter(
    (p) => p.productId.toString() !== req.params.productId
  );
  await cart.save();
  res.json(await populatedCart(req.user._id));
});

export const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user._id });
  if (cart) {
    cart.products = [];
    await cart.save();
  }
  res.json({ success: true, message: 'Cart cleared' });
});
