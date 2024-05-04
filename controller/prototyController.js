const { Catalog, } = require('../model/CatalogModel');
const { Prototy } = require('../model/PrototyModel');


const prototyController = {
    addPrototy: async (req, res) => {
        try {
            const { title, catalog, manUpdated } = req.body

            if (!title || !catalog || !manUpdated)
                return res.status(400).json({ status: false, data: 'Không được bỏ trống' });

            const newPrototy = new Prototy(req.body);
            const savePrototy = await newPrototy.save();

            setTimeout(async () => {
                const catalog = Catalog.findById(req.body.catalog);
                await catalog.updateOne({ $push: { properties: savePrototy._id } })
            }, 0)

            return res.status(200).json({ status: true, data: savePrototy });
        } catch (error) {
            console.log(error)
            return res.status(500).json({ status: false, data: 'lỗi' });
        }
    },
    getPrototy: async (req, res) => {
        try {
            const prototy = await Prototy.find().
                populate({
                    path: 'products',
                    select: ['name', 'price', 'quantity', 'imgs', 'size', 'origin', 'descripe', 'lever', 'knowledge', 'stage', 'catalog', 'prototy'],
                    populate: [
                        {
                            path: 'catalog', // Liên kết Catalog với Product
                            model: 'Catalog',
                            select: 'title'
                        },
                        {
                            path: 'prototy', // Liên kết Prototy với Product
                            model: 'Prototy',
                            select: 'title'
                        }
                    ]
                }).
                populate({
                    path: 'catalog',
                    model: 'Catalog',
                    select: 'title'
                }).select(['products', 'catalog', 'title']);

            return res.status(200).json({ status: true, data: prototy });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: false, data: 'lỗi' });
        }
    },
    getAllprototyWithID: async (req, res) => {
        try {
            const { id } = req.params;
            const { limit, page } = req.query;

            if (!id || !limit || !page)
                return res.status(400).json({ status: false, data: 'không có giá trị truyền vào' });

            const skip = (page - 1) * limit
            const prototy = await Prototy.findById(id).
                populate({
                    path: 'products',
                    select: ['name', 'price', 'quantity', 'imgs', 'size', 'origin', 'descripe', 'lever', 'knowledge', 'stage', 'catalog', 'prototy','updateAt'],
                    populate: [
                        {
                            path: 'catalog', // Liên kết Catalog với Product
                            model: 'Catalog',
                            select: 'title'
                        },
                        {
                            path: 'prototy', // Liên kết Prototy với Product
                            model: 'Prototy',
                            select: 'title'
                        },
                        {
                            path: 'imgs',
                            model: 'Image',
                            select: 'img'
                        }
                    ],
                    skip: skip,
                    limit: limit
                }).
                populate({
                    path: 'catalog',
                    model: 'Catalog',
                    select: 'title'
                }).select(['products', 'catalog', 'title']);

            return res.status(200).json({ status: true, data: prototy });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: false, data: 'lỗi' });
        }
    }
}

module.exports = prototyController;