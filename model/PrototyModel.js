var mongoose = require('mongoose');

const prototySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    catalog: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Catalog",
        required: true,
    },
    products: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
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

let Prototy = mongoose.model("Prototy", prototySchema);
module.exports = { Prototy}