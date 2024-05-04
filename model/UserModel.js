var mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        default: ""
    },
    address: {
        type: String,
        default: ""
    },
    phoneNumber: {
        type: String,
        unique: true,
        default: "",
    },
    createdAt:{
        type: String,
        default: Date.now()
    },
    updateAt:{
        type: String,
        default: Date.now()
    },
    carts: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
            },
            count: {
                type: Number,
                default: 1
            },checkbox:{
                type: Boolean,
                default: false
            }
        }
    ],
    orders: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
        }
    ],
    // 1: chưa 2 rồi
    isVerification:{
        type: Number,
        default: 1
    },
    code:{
        type: String,
        default: ''
    },
    //1 người dùng 2 web admin
    role:{
        type: Number,
        default: 1
    }
})

let User = mongoose.model("User", userSchema);
module.exports = { User }