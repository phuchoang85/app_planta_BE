const { Catalog } = require('../model/CatalogModel');
const { Product } = require('../model/ProductModel');
const { Prototy } = require('../model/PrototyModel');
const { Image } = require('../model/ImageModel');
const { default: mongoose } = require('mongoose');

const productController = {
    validateNameProduct: async (name, _id = null) => {
        const checkName = await Product.findOne({ "name": name, "_id": { $ne: _id } });

        if (checkName) {
            return false
        } else {
            return true
        }
    },
    addProduct: async (req, res) => {
        try {
            let { name, price, quantity,  origin, descripe,  catalog, manUpdated, prototy, img } = req.body;
            price = Number(price);
            quantity = Number(quantity);
            if (!name || isNaN(price) || isNaN(quantity) || !origin || !descripe  || !catalog || !manUpdated || !img)
                return res.status(400).json({ status: false, data: 'Không được bỏ trống' });

            if (!Array.isArray(prototy)) {
                return res.status(400).json({ status: false, data: 'prototy phải là mảng' });
            }

            if (!Array.isArray(img)) {
                return res.status(400).json({ status: false, data: 'img phải là mảng' });
            }

            const checkName = await productController.validateNameProduct(name);
            if (!checkName)
                return res.status(400).json({ status: false, data: 'Tên sản phẩm đã được tạo' });

            const newProduct = new Product(req.body);
            const saveProduct = await newProduct.save();

            img.map(async (ele) => {
                const newImage = new Image({ img: ele, manUpdated: manUpdated, product: newProduct._id });
                const saveImage = await newImage.save();

                const newproduct = Product.findById(newProduct._id);
                await newproduct.updateOne({ $push: { imgs: saveImage._id } })
            })

            if (prototy.length > 0) {
                prototy.map(async (ele) => {
                    const newprototy = Prototy.findById(ele);
                    await newprototy.updateOne({ $push: { products: newProduct._id } })
                })
            }


            const newcatalog = Catalog.findById(req.body.catalog);
            await newcatalog.updateOne({ $push: { products: saveProduct._id } })

            return res.status(200).json({ status: true, data: { ...saveProduct._doc, imgs: img } });
        } catch (error) {
            console.log(error)
            return res.status(500).json({ status: false, data: 'Lỗi' });
        }
    },
    updateProduct: async (req, res) => {
        try {
            let { name, price, quantity,  origin, descripe,  catalog, manUpdated, prototy, img } = req.body;
            const { _id } = req.query;

            price = Number(price);
            quantity = Number(quantity);
            if (!_id || !name || isNaN(price) || isNaN(quantity)  || !origin || !descripe  || !catalog || !manUpdated || !img)
                return res.status(400).json({ status: false, data: 'Không được bỏ trống' });

            if (!Array.isArray(prototy)) {
                return res.status(400).json({ status: false, data: 'prototy phải là mảng' });
            }

            if (!Array.isArray(img)) {
                return res.status(400).json({ status: false, data: 'img phải là mảng' });
            }

            const checkName = await productController.validateNameProduct(name, _id);
            if (!checkName)
                return res.status(400).json({ status: false, data: 'Tên sản phẩm đã được tạo' });

            const newProduct = await Product.findById(_id);            
            newProduct.imgs = [];

            await Image.deleteMany({ product: new mongoose.Types.ObjectId(_id) });

            // Tạo các promise cho việc thêm ảnh mới và cập nhật sản phẩm
            const imagePromises = img.map(async (ele) => {
                const newImage = new Image({ img: ele, manUpdated: manUpdated, product: _id });
                const saveImage = await newImage.save();
                newProduct.imgs.push(saveImage._id);
            });

            // Thực thi tất cả các promise cùng một lúc
            await Promise.all(imagePromises);

            // Xóa reference từ các prototype cũ
            for (const ele of newProduct.prototy) {
                const newprototy = await Prototy.findById(ele);
                await newprototy.updateOne({ $pull: { products: _id } });
            }

            // Cập nhật reference cho các prototype mới
            for (const ele of prototy) {
                const newprototy = await Prototy.findById(ele);
                await newprototy.updateOne({ $push: { products: _id } });
            }

            // Xóa reference từ danh mục cũ
            const oldcatalog = await Catalog.findById(newProduct.catalog);
            await oldcatalog.updateOne({ $pull: { products: _id } });

            // Cập nhật reference cho danh mục mới
            const newcatalog = await Catalog.findById(catalog);
            await newcatalog.updateOne({ $push: { products: _id } });


            newProduct.name = name;
            newProduct.price = price;
            newProduct.quantity = quantity;
            newProduct.origin = origin;
            newProduct.descripe = descripe;
            newProduct.catalog = catalog;
            newProduct.manUpdated = manUpdated;
            newProduct.prototy = prototy;
            newProduct.updateAt = Date.now();
            
            const saveProduct = await newProduct.save();

            return res.status(200).json({ status: true, data: { ...saveProduct._doc, imgs: img } });
        } catch (error) {
            console.log(error)
            return res.status(500).json({ status: false, data: 'Lỗi' });
        }
    },
    getplantgrow: async (req, res) => {
        try {
            const { limit, page } = req.query;


            if (!limit || !page)
                return res.status(400).json({ status: false, data: "Không được bỏ trống" });

            if (!parseInt(limit) || !parseInt(page))
                return res.status(400).json({ status: false, data: " limit và page đều phải là số" });


            const skip = (page - 1) * limit;

            const newProduct = await Product.find({ isExist: true })
                .populate({
                    path: 'imgs',
                    model: 'Image',
                    select: 'img'
                }).
                populate({
                    path: 'catalog',
                    model: 'Catalog',
                    select: 'title'
                }).
                populate({
                    path: 'prototy',
                    model: 'Prototy',
                    select: 'title'
                })
                .sort({ updateAt: -1 })
                .limit(limit)
                .skip(skip).select(['name', 'price','quantity','imgs','origin','descripe','knowledge','stage','catalog','prototy',]);
           
                return res.status(200).json({ status: true, data: newProduct });
        } catch (error) {
            console.log(error)
            return res.status(500).json({ status: false, data: 'lỗi' });
        }
    },
    getProduct: async (req, res) => {
        try {
            const { limit, page } = req.query;


            if (!limit || !page)
                return res.status(400).json({ status: false, data: "Không được bỏ trống" });

            if (!parseInt(limit) || !parseInt(page))
                return res.status(400).json({ status: false, data: " limit và page đều phải là số" });


            const skip = (page - 1) * limit;


            const newProduct = await Product.find()
                .populate({
                    path: 'imgs',
                    model: 'Image',
                    select: 'img'
                }).
                populate({
                    path: 'catalog',
                    model: 'Catalog',
                    select: 'title'
                }).
                populate({
                    path: 'prototy',
                    model: 'Prototy',
                    select: 'title'
                })
                .sort({ updateAt: -1 })
                .limit(limit)
                .skip(skip);
            return res.status(200).json({ status: true, data: newProduct });
        } catch (error) {
            console.log(error)
            return res.status(500).json({ status: false, data: 'lỗi' });
        }
    },
    get1Product: async (req, res) => {
        try {
            if (!req.params.id)
                return res.status(400).json({ status: false, data: "Không được bỏ trống id" });

            const newProduct = await Product.findById(req.params.id, { isExist: true })
                .populate({
                    path: 'imgs',
                    model: 'Image',
                    select: 'img'
                }).
                populate({
                    path: 'catalog',
                    model: 'Catalog',
                    select: ['title','isExist']
                }).
                populate({
                    path: 'prototy',
                    model: 'Prototy',
                    select: ['title','isExist']
                })
                .select(['name', 'price', 'quantity', 'imgs',  'origin', 'descripe', 'knowledge', 'stage', 'catalog', 'prototy','isExist']);

                if (!newProduct || !newProduct.isExist) {
                    return res.status(400).json({ status: false, data: "Không tìm thấy sản phẩm hoặc sản phẩm không tồn tại" });
                }

            return res.status(200).json({ status: true, data: newProduct });
        } catch (error) {
            console.log(error)
            return res.status(500).json({ status: false, data: 'lỗi' });
        }
    },
    getProductWithKey: async (req, res) => {
        try {
            const { limit, page, key } = req.query;


            if (!key || !limit || !page)
                return res.status(400).json({ status: false, data: "Không được bỏ trống" });

            if (!parseInt(limit) || !parseInt(page))
                return res.status(400).json({ status: false, data: " limit và page đều phải là số" });


            const skip = (page - 1) * limit;

            const newProduct = await Product.find({
                $or: [
                    { name: { $regex: key, $options: "i" } },
                    { descripe: { $regex: key, $options: "i" } },
                ],
                isExist: true
            }).limit(limit)
            .skip(skip)
                .populate({
                    path: 'imgs',
                    model: 'Image',
                    select: 'img'
                }).
                populate({
                    path: 'catalog',
                    model: 'Catalog',
                    select: ['title','isExist'],
                    match: {isExist: true}
                }).
                populate({
                    path: 'prototy',
                    model: 'Prototy',
                    select: ['title',"isExist"],
                    match: {isExist: true}
                })
                .select(['name', 'price', 'quantity', 'imgs',  'origin', 'descripe', 'knowledge', 'stage', 'catalog', 'prototy','isExist']);
                console.log(newProduct)
                return res.status(200).json({ status: true, data: newProduct });  
        } catch (error) {
            console.log(error)
            return res.status(500).json({ status: false, data: 'lỗi' });
        }
    },
    filterbyprice: async (req, res) => {
        try {
            const { min, max } = req.query;
            if (!min || !max)
                return res.status(400).json({ status: false, data: "Không được bỏ trống" });
            if (min > max)
                return res.status(400).json({ status: false, data: "Giá trị min lớn hơn giá trị max" });
            // $gte greater than  and euqal
            // $lte letter than  and euqal
            const result = await Product.find({ price: { $gte: min, $lte: max }, quantity: { $gte: 1 } })
                .populate({
                    path: 'imgs',
                    model: 'Image',
                    select: 'img'
                }).
                populate({
                    path: 'catalog',
                    model: 'Catalog',
                    select: 'title'
                }).
                populate({
                    path: 'prototy',
                    model: 'Prototy',
                    select: 'title'
                })
                .select(['name', 'price', 'quantity', 'imgs',  'origin', 'descripe','knowledge', 'stage', 'catalog', 'prototy'])
                .sort({ quantity: 1 });
            console.log(result)
            return res.status(200).json({ status: true, data: result });
        } catch (error) {
            console.log(error)
            return res.status(500).json({ status: false, data: 'lỗi' });
        }
    },
    deleteProduct: async (req, res) => {
        try {
            const { _id } = req.query;
            if (!_id)
                return res.status(400).json({ status: false, data: 'Không được bỏ trống' })

            const result = await Product.findById(_id);
            result.isExist = !result.isExist;
            await result.save()

            return res.status(200).json({ status: true, data: 'thành coong' })
        } catch (error) {
            console.log(error)
            return res.status(500).json({ status: false, data: 'lỗi' });
        }
    }
}

module.exports = productController;