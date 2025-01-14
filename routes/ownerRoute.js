const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user');
const storeModel = require('../models/store');
const productModel = require('../models/product');
const { generateToken } = require('../utils/generateToken');

router.post('/signUp', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const saltRounds = 10; 
    const salt = await bcrypt.genSalt(saltRounds); 
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = await userModel.create({
      username,
      email,
      password:hashedPassword
    });

    const token = generateToken({ email: newUser.email, id: newUser._id });
    res.cookie('token', token, { httpOnly: true });

    res.status(201).json({
      message: 'User signed up successfully',
      user: newUser,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/userInformation', async (req, res) => {
  const { userId, name, PAN_card, Aadhar_card, phone, Gst_id } = req.body;

  if (!userId || !name || !PAN_card || !Aadhar_card || !phone || !Gst_id) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { name, PAN_card, Aadhar_card, phone, Gst_id },
      { new: true }
    );

    res.status(200).json({
      message: 'User information updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = generateToken({ email: user.email, id: user._id });
    res.cookie('token', token, { httpOnly: true });

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/stores', async (req, res) => {
  const { username, location, contact } = req.body;

  if (!username || !location || !contact) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const user = await userModel.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newStore = await storeModel.create({
      username: user._id,
      location,
      contact,
    });

    res.status(201).json({
      message: 'Store created successfully',
      store: newStore,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/stores', async (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ message: 'Username is required' });
  }

  try {
    const user = await userModel.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const stores = await storeModel.find({ username: user._id });

    res.status(200).json({
      message: 'Stores retrieved successfully',
      stores,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/stores/products', async (req, res) => {
  const { store_id, name, description, quantity, price, status } = req.body;

  if (!store_id || !name || !quantity || !price) {
    return res.status(400).json({ message: 'All required fields must be provided' });
  }

  try {
    const product = await productModel.create({
      store_id,
      name,
      description,
      quantity,
      price,
      status,
    });

    res.status(201).json({
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/stores/products', async (req, res) => {
  const { store_id, sortBy = 'createdAt', sortOrder = 'desc', limit = 10, page = 1 } = req.query;

  try {
    const query = store_id ? { store_id } : {};
    const products = await productModel
      .find(query)
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalProducts = await productModel.countDocuments(query);

    res.status(200).json({
      message: 'Products fetched successfully',
      products,
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



module.exports = router;
