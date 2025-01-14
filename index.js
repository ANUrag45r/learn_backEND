dotenv.config();
const express = require('express');
const path = require('path');
const app = express();
const mongoose = require('mongoose')
const ownerRoute = require('./routes/ownerRoute');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./dataBase/connect'); 
const PORT = process.env.PORT || 8000;
connectDB()
  .then(() => {
    console.log('Database connected successfully');

    app.use(express.json());
    app.use(cors());
    app.use(helmet());
    app.use(morgan('dev'));

    app.use('/api/ZenNexify/owner', ownerRoute);

    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).json({
        message: 'An internal server error occurred',
        error: err.message, // Send the actual error message in development
      });
    });

    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection error:', err);
    process.exit(1); 
  });