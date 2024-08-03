const { User } = require('../model/UserModel');
const bcrypt = require('bcryptjs')
const { verificationcodes } = require('./sendemail')
require('dotenv').config({ path: '.env' });
const jwt = require('jsonwebtoken');

const verifyTokenAndCode = (token, code, email) => {
    try {
        const decoded = jwt.verify(token, process.env.secretKey); // Giải mã token

        const currentTime = Math.floor(Date.now() / 1000); // Thời gian hiện tại tính bằng giây
        if (decoded.exp < currentTime) {
            return { status: false, data: 'Token đã hết hạn' };
        }

        if (email != decoded.email)
            return { status: false, data: 'không trùng email' };

        // Kiểm tra xem mã xác minh trong token có trùng khớp với mã xác minh được nhập không
        if (decoded.code === code) {
            return { status: true, data: 'thành công' }; // Mã xác minh hợp lệ
        } else {
            return { status: false, data: 'không đúng code' }; // Mã xác minh không hợp lệ
        }

    } catch (error) {
        console.log(error)
        return { status: false, data: 'Lỗi xác minh mã token' }; // Lỗi xác minh token
    }
};

const userController = {
    validateEmail: async (email, _id = null) => {
        const checkEmail = await User.findOne({ "email": email, "_id": { $ne: _id } });

        if (checkEmail) {
            return false
        } else {
            return true
        }

    },
    validateNumber: async (phoneNumber, _id = null) => {
        const checkNumber = await User.findOne({ "phoneNumber": phoneNumber, "_id": { $ne: _id } });

        if (checkNumber) {
            return false
        } else {
            return true
        }

    },
    register: async (req, res) => {
        try {
            let { email, password, name, phoneNumber } = req.body;

            if (!email || !password || !name || !phoneNumber)
                return res.status(400).json({ status: false, data: "không đưuọc bỏ trống dữ liệu" });

            const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!email.match(regexEmail))
                return res.status(400).json({ status: false, data: "Email không đúng định dạng" });

            const regexPassword = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/;
            if (!password.match(regexPassword))
                return res.status(400).json({ status: false, data: "mật khẩu phải có ít nhất 1 kí tự thường, 1 kí tự hoa, 1 kí tự đặc biệt, 1 kí tự số và độ dài phải hơn 6" })

            const regexPhonenumber = /^[\d]{10}/
            if (!phoneNumber.match(regexPhonenumber))
                return res.status(400).json({ status: false, data: "Số điện thoại không đúng định dạng" })

            if (name.length < 6)
            if (name.length < 6)
                return res.status(400).json({ status: false, data: "Tên phải trên 6 kí tự" })

            const checkEmail = await userController.validateEmail(email);
            if (!checkEmail)
                return res.status(400).json({ status: false, data: "Email đã được đăng kí" });

            const checkPhoneNumber = await userController.validateNumber(phoneNumber);
            if (!checkPhoneNumber)
                return res.status(400).json({ status: false, data: "Số điện thoại đã được đăng kí" });

            const salt = bcrypt.genSaltSync(10);
            password = bcrypt.hashSync(password, salt);

            const user = {
                email: email,
                password: password,
                name: name,
                phoneNumber: phoneNumber,
                isVerification: 1,
                code: ""
            }

            const newUser = new User(user);


            const code = await verificationcodes(email);
            newUser.code = code;
            newUser.role = 1;

            const saveUser = await newUser.save();

            return res.status(200).json({ status: true, data: saveUser });

        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: false, data: 'Không thể đăng kí' });
        }
    },
    verificationEmail: async (req, res) => {
        try {
            const { email, token } = req.query;

            if (!email || !token)
                return res.status(400).json({ status: false, data: 'không được bỏ trống' });

            const user = await User.findOne({ email: email });
            if (!user)
                return res.status(400).json({ status: false, data: 'không timf thấy tài khoản có chứa email này' });

            const result = await verifyTokenAndCode(token, user.code, email)
            if (result.status) {
                user.isVerification = 2;
                user.code = ""
                user.save();

                return res.status(200).json({ status: true, data: result.data });
            } else {
                return res.status(400).json({ status: false, data: result.data });
            }

        } catch (error) {

        }
    },
    sendcode: async (req, res) => {
        try {
            const { email, type } = req.query;
            if (!email) {

                return res.status(400).json({ status: false, data: "Không đưuọc bỏ trống" })
            }


            const user = await User.findOne({ email: email });

            if (!user) {
                return res.status(400).json({ status: false, data: "Không tìm thấy tài khoản" });
            }


            const code = await verificationcodes(email);
            user.code = code;
            console.log(code)
            await user.save();

            return res.status(200).json({ status: true, data: 'đã gửi' });
        } catch (error) {
            console.log(error)
            return res.status(500).json({ status: false, data: 'lỗi' });
        }
    },
    login: async (req, res) => {
        try {
            const user = req.body;

            if (!user.email || !user.password)
                return res.status(400).json({ status: false, data: "Không được bỏ trống dữ liệu" });

            const resultEmail = await User.findOne({ 'email': user.email }).populate(
                {
                    path: 'carts',
                    populate: {
                        path: 'product',
                        model: 'Product',
                        select: ['name', 'price', 'imgs', 'quantity', 'prototy', 'updateAt'],
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
                        ],
                    },
                    options: { lean: true }, // Sử dụng lean để trả về plain JavaScript objects
                    each: (product) => {
                        // Thêm thuộc tính checkbox nếu không tồn tại
                        if (!product.hasOwnProperty('checkbox')) {
                            product.checkbox = false;
                        }
                    }
                }

            ).select(['name', 'email', 'password', 'avatar', 'address', 'phoneNumber', 'carts', 'orders', 'role'])

            if (!resultEmail)
                return res.status(400).json({ status: false, data: "Không tìm thấy email" });

            const check = bcrypt.compareSync(user.password, resultEmail.password)
            if (!check) {
                return res.status(400).json({ status: false, data: "Không đúng mật khẩu" });
            }

            if (resultEmail.role.toString() != '1')
                return res.status(400).json({ status: false, data: 'không phải tài khoản người dùng' })

            const returndata = {
                name: resultEmail.name,
                email: resultEmail.email,
                avatar: resultEmail.avatar,
                address: resultEmail.address,
                phoneNumber: resultEmail.phoneNumber,
                carts: resultEmail.carts,
                orders: resultEmail.orders,
                _id: resultEmail._id,
            }

            return res.status(200).json({ status: true, data: returndata });

        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: false, data: "Không đăng nhập được" })
        }
    },
    updateUser: async (req, res) => {
        try {
            let { email, name, phoneNumber, address, _id } = req.body;

            if (!email || !name || !phoneNumber || !address || !_id)
                return res.status(400).json({ status: false, data: "Không được bỏ trống dữ liệu" });

            const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!email.match(regexEmail))
                return res.status(400).json({ status: false, data: "Email không đúng định dạng" });

            const regexPhonenumber = /^[\d]{10}/
            if (!phoneNumber.match(regexPhonenumber))
                return res.status(400).json({ status: false, data: "Số điện thoại không đúng định dạng" })

            if (name.length < 6)
                return res.status(400).json({ status: false, data: "Tên phải trên 6 kí tự" })
            // const regexLinkAnh = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif))/

            // if (!avatar.match(regexLinkAnh))
            //     return res.status(400).json({ status: false, data: 'Phải là đường link ảnh' })


            const checkEmail = await userController.validateEmail(email, _id);
            if (!checkEmail)
                return res.status(400).json({ status: false, data: "Email đã được đăng kí" });

            const checkPhoneNumber = await userController.validateNumber(phoneNumber, _id);
            if (!checkPhoneNumber)
                return res.status(400).json({ status: false, data: "Số điện thoại đã được đăng kí" });



            const updatedUser = await User.findByIdAndUpdate(_id, {
                email: email,
                name: name,
                phoneNumber: phoneNumber,
                avatar: avatar,
                address: address,
                updateAt: Date.now()
            },);


            return res.status(200).json({ status: true, data: updatedUser });

        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: false, data: 'Lỗi' })
        }
    },
    deleteAll: async (req, res) => {
        try {
            const { _id } = req.params;
            if (!_id)
                return res.status(400).json({ status: false, data: 'không được bỏ trống' })

            const user = await User.findByIdAndUpdate(_id, { carts: [] });
            if (!user)
                return res.status(400).json({ status: false, data: 'Không tìm thấy người dùng' })

            return res.status(200).json({ status: true, data: 'xóa thành công' })
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: false, data: 'Lỗi' })
        }
    },
    deleteCartHaveCheck: async (req, res) => {
        try {
            const { _id } = req.params;
            if (!_id)
                return res.status(400).json({ status: false, data: 'không được bỏ trống' })

            const user = await User.findById(_id);
            if (!user)
                return res.status(400).json({ status: false, data: 'Không tìm thấy người dùng' })

            user.carts = user.carts.filter(ele => ele.checkbox == false)
            await user.save();


            return res.status(200).json({ status: true, data: 'đã xóa thành công' })
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: false, data: 'lỗi' })
        }
    },
    deleteCart: async (req, res) => {
        try {
            const { idproduct, _id } = req.body;
            if (!idproduct || !_id)
                return res.status(400).json({ status: false, data: 'không được bỏ trống' })

            const user = await User.findById(_id);

            if (!user)
                return res.status(400).json({ status: false, data: 'Không tìm thấy người dùng' })

            user.carts.pull({ _id: idproduct });
            console.log(user.carts)
            await user.save();

            return res.status(200).json({ status: true, data: 'Product removed from cart successfully' });

        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: false, data: 'Lỗi' })
        }
    },
    updateCart: async (req, res) => {
        try {
            const { cart } = req.body;
            const { id } = req.params;
            console.log(cart)
            if (!Array.isArray(cart))
                return res.status(400).json({ status: false, data: 'cart phải là mảng' });

            const resultusser = await User.updateOne({ _id: id }, { $set: { carts: cart } })

            return res.status(200).json({ status: true, data: 'Thành công' })
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: false, data: 'Lỗi' })
        }
    },
    addCart: async (req, res) => {
        try {
            const item = req.body;
            const { id } = req.params;

            if (!item?.product || !id)
                return res.status(400).json({ status: false, data: 'không đưuọc bỏ trống' });
            const cartUser = await User.findById(id)
                .select('carts');
            let oldCart = cartUser.carts

            const existingCartItemIndex = oldCart.findIndex(ele => ele.product == item.product);

            if (existingCartItemIndex !== -1) {
                // Nếu sản phẩm đã tồn tại trong giỏ hàng, cập nhật số lượng
                oldCart[existingCartItemIndex].count += item.count;
            } else {
                // Nếu sản phẩm chưa tồn tại trong giỏ hàng, thêm sản phẩm mới vào giỏ hàng
                oldCart.push(item);
            }

            const resultusser = await User.updateOne({ _id: id }, { $set: { carts: oldCart } })

            return res.status(200).json({ status: true, data: oldCart })
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: false, data: 'Lỗi' })
        }
    },
    getCart: async (req, res) => {
        try {
            const { id } = req.params;
            if (!id)
                return res.status(400).json({ status: false, data: 'không được bỏ trống' })
            const cartUser = await User.findById(id)
                .populate(
                    {
                        path: 'carts',
                        populate: {
                            path: 'product',
                            model: 'Product',
                            select: ['name', 'price', 'imgs', 'quantity', 'prototy'],
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
                )
                .select('carts')

            return res.status(200).json({ status: true, data: cartUser.carts })

        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: false, data: 'Lỗi' })
        }
    },
    getOrder: async (req, res) => {
        try {
            const { id } = req.query;

            if (!id)
                return res.status(400).json({ status: false, data: 'không được bỏ trống' })

            const user = await User.findById(id)
                .populate(
                    {
                        path: 'orders',
                        populate: {
                            path: 'listproduct',
                            populate: {
                                path: 'product',
                                model: 'Product',
                                select: ['name', 'price', 'imgs', 'quantity', 'prototy'],
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
                    }
                )
                .select('orders')
                .sort({ _id: 1 })

            return res.status(200).json({ status: true, data: user.orders })
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: false, data: 'lỗi' });
        }
    },
    loginAdmin: async (req, res) => {
        try {
            const user = req.body;

            if (!user.email || !user.password)
                return res.status(400).json({ status: false, data: "Không được bỏ trống dữ liệu" });

            const resultEmail = await User.findOne({ 'email': user.email })
            if (!resultEmail)
                return res.status(400).json({ status: false, data: "Không tìm thấy email" });

            const check = bcrypt.compareSync(user.password, resultEmail.password)
            if (!check) {
                return res.status(400).json({ status: false, data: "Không đúng mật khẩu" });
            }

            if (resultEmail.role != 2)
                return res.status(400).json({ status: false, data: 'không phải tài khoản admin' })


            return res.status(200).json({ status: true, data: resultEmail });

        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: false, data: "Không đăng nhập được" })
        }
    },
    getAllUser: async (req, res) => {
        try {
            const data = await User.find().sort({ createdAt: -1 });

            return res.status(200).json({ status: true, data: data })
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: false, data: 'Lỗi' })
        }
    }
}



module.exports = userController;