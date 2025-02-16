const express = require('express');
const router = express.Router();

const Product = require('../models/Product');

/**
 * @route GET /.../products
 * @desc Returns all products from the database
 * @access Public
 * 
 * @usage Example request:
 * GET /.../products
 * 
 * @returns {JSON} Array of product objects
 */
router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;