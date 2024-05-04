const { Image } = require('../model/ImageModel');
const { Product } = require('../model/ProductModel');


const imageController = {
    addImage: async (req, res) => {
        console.log(req)
        try {
            const { img, product, manUpdated } = req.body;

            if (!img || !product || !manUpdated)
                return res.status(400).json({ status: false, data: 'Không được bỏ trống giá trị' });

            const regexImage = /https?:\/\/.*?\.(?:png|jpg|jpeg)/;

            if (!img.match(regexImage))
                return res.status(400).json({ status: false, data: 'Không phải định dạng hình dạng png | jpg | jpeg' });

            const newImage = new Image(req.body);
            const saveImage = await newImage.save();

            setTimeout(async () => {
                const newproduct = Product.findById(req.body.product);
                await newproduct.updateOne({ $push: { imgs: saveImage._id } })
            }, 0)

            console.log(newImage)
            return res.status(200).json({ status: true, data: saveImage });
        } catch (error) {
            console.log(error)
            return res.status(500).json({ status: false, data: 'lỗi' });
        }
    },

}

module.exports = imageController;