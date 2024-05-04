var mongoose = require('mongoose');


const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    price: {
        type: Number,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    imgs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Image"
        }
    ],
    size: {
        type: String,
        required: true,
    },
    origin: {
        type: String,
        required: true
    },
    descripe: {
        type: String,
        required: true
    },
    lever: {
        type: String,
        required: true
    },
    knowledge: {
        type: Array,
        default: []
    },
    stage: {
        type: Array,
        default: []
    },
    catalog: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Catalog",
        required: true,
    },
    prototy: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Prototy",
        }
    ],
    createdAt: {
        type: String,
        default: Date.now()
    },
    updateAt: {
        type: String,
        default: Date.now()
    },
    manUpdated: {
        type: String,
        required: true
    },
    isExist:{
        type: Boolean,
        default: true
    }
})


let Product = mongoose.model("Product", productSchema);
module.exports = { Product }