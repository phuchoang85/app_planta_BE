var mongoose = require('mongoose');


const imageSchema = new mongoose.Schema({
    img: {
        type: "String",
        required: true,
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
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
    }
})
let Image = mongoose.model("Image", imageSchema);

module.exports = { Image }