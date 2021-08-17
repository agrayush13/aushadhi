var mongoose = require('mongoose');

var productSchema = mongoose.Schema({
    name: String,
    manufacturer: String,
    tags: [String],
    price: Number,
    image: String,
    inStock: Boolean
});

var Product = mongoose.model("Product", productSchema);

module.exports = Product;