const { Order } = require('../model/OrderModel');
const { User } = require('../model/UserModel');
const { Product } = require('../model/ProductModel');

const orderController = {
    checklistpro: async (list) => {
        try {
            for (let i = 0; i < list.length; i++) {
                const findPro = await Product.findById(list[i].product._id);

                if (!findPro || !findPro.isExist) {
                    return false;
                }

                if (findPro.quantity < list[i].count || findPro.quantity < findPro.quantity - list[i].count) {
                    return false;
                }
            }

            return true;
        } catch (error) {
            console.log(error)
            return false;
        }
    },

    decreaseQuantityProduct: async (list) => {
        try {
            for (let i = 0; i < list.length; i++) {
                const findPro = await Product.findById(list[i].product._id);
                const spconlai = findPro.quantity - list[i].count;
                findPro.quantity = spconlai;
                await findPro.save();
            }
        } catch (error) {
            console.log(error)
        }
    },

    increaseQuantityProduct: async (list) => {
        try {
            for (let i = 0; i < list.length ; i++) {
                const findPro = await Product.findById(list[i].product._id);
                const spconlai = findPro.quantity + list[i].count;
                findPro.quantity = spconlai;
                await findPro.save();
            }
        } catch (error) {
            console.log(error)
        }
    },
    addOrder: async (req, res) => {
        try {
            const { user, payment, express, listproduct, namePayOrder, emailPayOrder, addressPayOrder, phonenumberPayOrder, totalPrice } = req.body;

            if (!user || !payment || !express || listproduct.length == 0 || !namePayOrder || !emailPayOrder || !addressPayOrder || !phonenumberPayOrder || !totalPrice)
                return res.status(400).json({ status: false, data: 'Không đưuọc bỏ trống' })

            if (isNaN(totalPrice))
                return res.status(400).json({ status: false, data: 'total price phải là số' })

            const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailPayOrder.match(regexEmail))
                return res.status(400).json({ status: false, data: "Email không đúng định dạng" });

            const regexPhonenumber = /^[\d]{10}/
            if (!phonenumberPayOrder.match(regexPhonenumber))
                return res.status(400).json({ status: false, data: "Số điện thoại không đúng định dạng" })
  
            if (namePayOrder.length < 6)
                return res.status(400).json({ status: false, data: "Tên phải trên 6 kí tự" })

            const finduser = await User.findById(user)
            if (!finduser)
                return res.status(400).json({ status: false, data: 'Không tìm thấy user' })


            const checklisst = await orderController.checklistpro(listproduct)
            if (!checklisst)
                return res.status(400).json({ status: false, data: 'Product lỗi' })

            const newOrder = new Order(req.body);
            const saveOrder = await newOrder.save()

            for (const product of listproduct) {
                const index = finduser.carts.findIndex(ele => ele.product == product.product._id)
                if (index !== -1) {
                    finduser.carts.splice(index, 1);
                }
            }
            finduser.orders = [...finduser.orders, saveOrder._id];

            await finduser.save();

            await orderController.decreaseQuantityProduct(listproduct);

            return res.status(200).json({ status: true, data: saveOrder });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: false, data: 'Lỗi' })
        }
    },
    getOrer: async (req, res) => {
        try {
            let { limit, page } = req.query;

            if (limit && page && limit !== null && page !== null && !isNaN(parseInt(limit)) && !isNaN(parseInt(page))) {
                const skip = (page - 1) * limit
                const data = await Order.find()
                    .populate(
                        {
                            path: 'listproduct',
                            populate: {
                                path: 'product',
                                model: 'Product',
                                populate: [
                                    {
                                        path: 'prototy', // Liên kết Prototy với Product
                                        model: 'Prototy',
                                        select: 'title'
                                    }, {
                                        path: 'imgs', // Liên kết Catalog với Product
                                        model: 'Image',
                                        select: 'img'
                                    }
                                ]
                            },
                        }
                    ).limit(limit)
                    .skip(skip)
                    .sort({ createdAt: -1 });
                return res.status(200).json({ status: true, data: data })
            } else {
                const data = await Order.find().sort({ createdAt: -1 });

                return res.status(200).json({ status: true, data: data })
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: false, data: 'Lỗi' })
        }
    },
    updateStatus: async (req, res) => {
        try {
            const { status, _id } = req.query;

            if (!status || !_id)
                return res.status(400).json({ status: false, data: 'Không được bỏ trống' });
            if (isNaN(status)) {
                return res.status(400).json({ status: false, data: 'status phải là số' })
            }

            if (status == 4) {
                const findorder = await Order.findById(_id);
                await orderController.increaseQuantityProduct(findorder.listproduct);
                findorder.status = 4;
                await findorder.save();
            } else {
                if (status < 3) {
                    await Order.findByIdAndUpdate(_id, { status: parseInt(status) + 1 })
                } else {
                    return res.status(400).json({ status: false, data: 'Không thể chuyển status đc nx' })
                }
            }

            return res.status(200).json({ status: true, data: 'Thành công' })

        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: false, data: 'Lỗi' })
        }
    }
}


module.exports = orderController