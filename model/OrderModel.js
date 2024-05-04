var mongoose = require('mongoose');


const orderSchema = new mongoose.Schema({
    namePayOrder: {
        type: String,
        required: true
    },
    emailPayOrder: {
        type: String,
        required: true
    },
    addressPayOrder: {
        type: String,
        required: true
    },
    phonenumberPayOrder: {
        type: String,
        required: true
    },
    createdAt: {
        type: String,
        default: Date.now
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    // 1 đang xác nhận 2 giao hàng 3 giao thành công 4 đã hủy
    status: {
        type: Number,
        default: 1
    },
    payment: {
        type: String,
        required: true
    },
    express: {
        type: Object,
        required: true
    },
    totalPrice:{
        type: Number,
        required: true
    },
    listproduct: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
            },
            count: {
                type: Number,
            }
        }
    ]
})


let Order = mongoose.model("Order", orderSchema);

module.exports = { Order }