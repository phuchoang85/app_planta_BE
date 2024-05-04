const { Catalog } = require('../model/CatalogModel');
const { Prototy } = require('../model/PrototyModel');

const catalogController = {
    validateCatalog: async (catalog, _id = null) => {
        const checkCatalog = await Catalog.findOne({ "title": catalog, "_id": { $ne: _id } });

        if (checkCatalog) {
            return false
        } else {
            return true
        }
    },
    addCatalog: async (req, res) => {
        try {
            const { title, manUpdated, prototy } = req.body
            if (!title || !manUpdated)
                return res.status(400).json({ status: false, data: 'Không có giá trị của title' });

            const checkCatalogTitle = await catalogController.validateCatalog(title);
            if (!checkCatalogTitle)
                return res.status(400).json({ status: false, data: 'tên catalog đã được tạo' })

            const body = {
                title: title,
                manUpdated: manUpdated
            }

            const newCatalog = new Catalog(body);
            const saveCatalog = await newCatalog.save();

            setTimeout(async () => {

                if (prototy.length != 0) {
                    prototy.map(async (ele) => {
                        const bodyadd = {
                            catalog: saveCatalog._id,
                            title: ele,
                            manUpdated: manUpdated
                        }
                        const newPrototy = new Prototy(bodyadd);
                        const savePrototy = await newPrototy.save();
                        console.log(saveCatalog._id)
                        await Catalog.findByIdAndUpdate(
                            saveCatalog._id,
                            { $push: { properties: savePrototy._id } }
                        );

                    })
                }
            }, 0)

            console.log(newCatalog)
            return res.status(200).json({ status: true, data: 'thành công' });
        } catch (error) {
            console.log(error)
            return res.status(500).json({ status: false, data: 'Lỗi' });
        }
    },
    getCatalog: async (req, res) => {
        try {
            const catalog = await Catalog.find({ isExist: true })
                .populate({
                    path: 'products',
                    match: { isExist: true },
                    select: ['name', 'price', 'imgs', 'quantity'],
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
                        }, {
                            path: 'imgs', // Liên kết Catalog với Product
                            model: 'Image',
                            select: 'img'
                        }
                    ]
                })
                .populate({
                    path: 'properties', // Liên kết Prototy với Catalog
                    model: 'Prototy',
                    select: 'title',
                    match: { isExist: true },
                })
                .select(['title', 'products', 'properties'])

            return res.status(200).json({ status: true, data: catalog });
        } catch (error) {
            console.log(error)
            return res.status(500).json({ status: false, data: 'lỗi' })
        }
    },
    getOneCatalog: async (req, res) => {
        try {
            const { id } = req.params;
            const { limit, page } = req.query;

            if (!id || !limit || !page)
                return res.status(400).json({ status: false, data: 'không có giá trị truyền vào' });

            const skip = (page - 1) * limit

            const catalog = await Catalog.findById(id, { isExist: true })
                .populate({
                    path: 'products',
                    match: { isExist: true },
                    select: ['name', 'price', 'imgs', 'quantity', 'catalog', 'prototy'],
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
                        }, {
                            path: 'imgs', // Liên kết Catalog với Product
                            model: 'Image',
                            select: 'img'
                        }
                    ],
                    skip: skip,
                    limit: limit
                })
                .populate({
                    path: 'properties', // Liên kết Prototy với Catalog
                    model: 'Prototy',
                    select: 'title',
                    match: { isExist: true },
                })
                .select(['title', 'products', 'properties']);

            if (!catalog)
                return res.status(400).json({ status: false, data: 'không còn tồn tại' })

            return res.status(200).json({ status: true, data: catalog });

        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: false, data: "Lỗi" });
        }
    },
    getNewCatalog: async (req, res) => {
        try {
            const { id } = req.params;
            const { limit, page } = req.query;

            if (!id || !limit || !page)
                return res.status(400).json({ status: false, data: 'không có giá trị truyền vào' });

            const skip = (page - 1) * limit

            const today = new Date();
            today.setHours(23, 59, 59);

            const lastwweek = new Date(today);
            lastwweek.setDate(lastwweek.getDate() - 6);
            lastwweek.setHours(0, 0, 0);
            // tìm ngày ở tuần trước
            // Tính toán thời gian kết thúc của tuần hiện tại



            const catalog = await Catalog.findById(id, { isExist: true })
                .populate({
                    path: 'products',
                    match: { isExist: true },
                    select: ['name', 'price', 'imgs', 'quantity', 'catalog', 'prototy', 'updateAt'],
                    match: {
                        updateAt: { $gte: lastwweek.getTime(), $lte: today.getTime() } // Lọc sản phẩm theo thời gian tạo, trong khoảng thời gian từ đầu đến cuối ngày hôm nay
                    },
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
                        }, {
                            path: 'imgs', // Liên kết Catalog với Product
                            model: 'Image',
                            select: 'img'
                        }
                    ],
                    skip: skip,
                    limit: limit
                })
                .populate({
                    path: 'properties', // Liên kết Prototy với Catalog
                    model: 'Prototy',
                    select: 'title',
                    match: { isExist: true },
                })
                .select(['title', 'products', 'properties']);

            if (!catalog)
                return res.status(400).json({ status: false, data: 'Không tồn tại ' })

            return res.status(200).json({ status: true, data: catalog });

        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: false, data: "Lỗi" });
        }
    },
    getAllCatalogAndPrototy: async (req, res) => {
        try {
            const catalog = await Catalog.find()
                .populate({
                    path: 'properties', // Liên kết Prototy với Catalog
                    model: 'Prototy',
                    select: 'title'
                })
                .select(['title', 'properties']);

            return res.status(200).json({ status: true, data: catalog })
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: false, data: "Lỗi" });
        }
    },
    admingetcatalogAndCategory: async (req, res) => {
        try {
            const { limit, page } = req.query

            if (!limit || !page)
                return res.status(400).json({ status: false, data: "Không được bỏ trống" });

            if (!parseInt(limit) || !parseInt(page))
                return res.status(400).json({ status: false, data: " limit và page đều phải là số" });

            const skip = (page - 1) * limit;

            const catalog = await Catalog.find()
                .populate({
                    path: 'properties', // Liên kết Prototy với Catalog
                    model: 'Prototy',
                    select: ['title', 'isExist']
                }).populate({
                    path: 'products',
                    select: ['name', 'price', 'imgs', 'quantity'],
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
                        }, {
                            path: 'imgs', // Liên kết Catalog với Product
                            model: 'Image',
                            select: 'img'
                        }
                    ]
                })
                .skip(skip)
                .limit(limit)


            return res.status(200).json({ status: true, data: catalog })

        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: false, data: "Lỗi" });
        }
    },
    deleteCatalog: async (req, res) => {
        try {
            const { id, admin } = req.query
            if (!id || !admin) {
                return res.status(400).json({ status: false, data: 'không đc bỏ trống' })
            }

            const catalog = await Catalog.findById(id);
            if (!catalog)
                return res.status(400).json({ status: false, data: 'không tìm thấy' });

            catalog.isExist = !catalog.isExist;
            await catalog.save();

            return res.status(200).json({ status: true, data: 'thành công' })

        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: false, data: "Lỗi" });
        }
    },
    updatecatalogandrpototies: async (req, res) => {
        try {
            const { title, manUpdated, prototy } = req.body
            const { _id } = req.query
            if (!title || !manUpdated || !_id)
                return res.status(400).json({ status: false, data: 'Không có giá trị của title' });

            const checkCatalogTitle = await catalogController.validateCatalog(title, _id);
            if (!checkCatalogTitle)
                return res.status(400).json({ status: false, data: 'tên catalog đã được tạo' })

            const newCatalog = await Catalog.findById(_id);

            newCatalog.title = title;
            newCatalog.manUpdated = manUpdated;


            if (prototy.length != 0) {
                prototy.map(async (ele) => {
                    if (ele._id) {
                        await Prototy.findByIdAndUpdate(
                            ele._id,
                            { $set: { isExist: ele.isExist } }
                        );
                    } else {
                        const bodyadd = {
                            catalog: _id,
                            title: ele,
                            manUpdated: manUpdated
                        }
                        const newPrototy = new Prototy(bodyadd);
                        const savePrototy = await newPrototy.save();

                        await Catalog.findByIdAndUpdate(
                            _id,
                            { $push: { properties: savePrototy._id } }
                        );

                    }
                })
            }

            await newCatalog.save();
            console.log(newCatalog)
            return res.status(200).json({ status: true, data: 'thành công' });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ status: false, data: "Lỗi" });
        }
    }
}


module.exports = catalogController;