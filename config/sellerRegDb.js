const mongoose = require('mongoose');
const seller = new mongoose.Schema({
    "name": {
        type: String,
        required: true
    },
    "email": {
        type: String,
        required: true
    },
    "password": {
        type: String,
        required: true
    },
    "contact": {
        type: Number,
        required: true
    },
    "address": {
        type: String,
        required: true
    },
    "product_type": {
        type: String,
        required: true
    },
    "details": {
        type: String,
        required: true
    },
    "flag": {
        type: Number,
        default: 2
    }
});

const sellerSchema = mongoose.model("Seller", seller);
module.exports = sellerSchema;