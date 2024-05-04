var mongoose = require('mongoose');

const catalogSchema = new mongoose.Schema({
    products: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
        }
    ],
    title: {
        type: String,
        required: true,
        unique: true
    },
    properties: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Prototy",
        }
    ],
    createdAt: {
        type: String,
        default: Date.now()
    },
    updateAt:{
        type: String,
        default: Date.now()
    },manUpdated:{
        type: String,
        required: true
    },
    isExist:{
        type: Boolean,
        default: true
    }
})


let Catalog = mongoose.model("Catalog", catalogSchema);
module.exports = { Catalog }