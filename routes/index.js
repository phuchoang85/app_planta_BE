var express = require('express');
var router = express.Router();
const productController = require('../controller/productController')
const imageController = require('../controller/imageController')
const catalogController = require('../controller/catalogController');
const prototyController = require('../controller/prototyController');
const userController = require('../controller/userController');
const orderController = require('../controller/orderController')
//http://localhost:6868/

// post
// { 
// "name" : "sp1", 
// "price": 100000,
// "quantity": 200,
// "size": "m",
// "origin": "trung quốc",
// "descripe":"mo tả",
// "lever":"3/6",
// "catalog":"" ,
// "prototy":[] ,
// "manUpdated": "phuc",
// "img": ["https://cdn.tgdd.vn/Files/2021/07/30/1371866/cay-lan-chi-loai-cay-trong-co-cong-dung-chua-benh-cuc-hay-202202141338396794.jpg"]
// }

router.post('/addproduct', productController.addProduct);
router.post('/updateproduct',productController.updateProduct)


router.get('/getproductadmin', productController.getProduct);
router.get('/getplantgrow', productController.getplantgrow);

router.get('/getproduct/oneproduct/:id', productController.get1Product);
router.get('/getproduct/timkiem', productController.getProductWithKey);
router.get('/getproduct/loc-theo-gia', productController.filterbyprice);
router.get('/deleteproduct', productController.deleteProduct);


// { "img":"sp1","product":"" }
router.post('/addImage', imageController.addImage);

//post catalog
// {"title": "cây trồng"}
router.post('/addcatalog', catalogController.addCatalog);
router.get('/getcatalog', catalogController.getCatalog);
router.get('/getnewcatalog/:id', catalogController.getNewCatalog);
router.get('/getcatalog/:id', catalogController.getOneCatalog);
router.get('/getAllCatalogAndPrototy',catalogController.getAllCatalogAndPrototy);
router.get('/getadminCatalogAndPrototy',catalogController.admingetcatalogAndCategory);
router.get('/deleteCatalog',catalogController.deleteCatalog);
router.post('/updatecatalog',catalogController.updatecatalogandrpototies);
// post user
/*
    {
    "name" : "user1"
    "email" : "email2"
    "password" : "password"
    "phoneNumber": "phoneNumber"
    }
*/
router.post('/register', userController.register);

router.post('/dang-ki', userController.register);
router.post('/dang-nhap', userController.login);
router.post('/dang-nhap-admin', userController.loginAdmin);
router.post('/cap-nhat-tai-khoan', userController.updateUser);
/*
    {
        email:'phucvhps30903@fpt.edu.vn'
    }
*/
router.get('/xac-thuc-email', userController.verificationEmail);
/*
    {
       "email" : "email2"
    "password" : "password"
    }
*/
router.get('/getalluser', userController.getAllUser)
router.post('/login', userController.login);
router.put('/updatecart/:id', userController.updateCart);
router.put('/addCart/:id', userController.addCart);
router.get('/getCart/:id', userController.getCart);

/*
{
        "name": "uscdurSsA",
        "email": "email2",
        "password": "password",
        "avatar": "hehe",
        "address": "hehe",
        "phoneNumber": "0392892102",
        "_id": "65f2d40d6ea9c4b647755929",
        }
*/
router.post('/updateuser', userController.updateUser);


router.get('/sendcode', userController.sendcode);
/**
 {
"idproduct": "65f7be74d068ee81f48d611b",
    "_id": "65f2d40d6ea9c4b647755929"
 }
 */
router.post('/deleteproductinCart', userController.deleteCart);

// {
//     "_id": "65f2d40d6ea9c4b647755929"
// }
router.delete('/deleteAllcart/:_id', userController.deleteAll)
// {
//     "_id": "65f2d40d6ea9c4b647755929"
// }
router.delete('/deleteProductHaveCheckcart/:_id', userController.deleteCartHaveCheck)

router.get('/getOrder',userController.getOrder)

// post prototy
// {"title": "ưu sáng", "catalog":"", "manUpdated","phuc"}
router.post('/addprototy', prototyController.addPrototy);
router.get('/getprototy', prototyController.getPrototy);
router.get('/getAllprototyWithID/:id', prototyController.getAllprototyWithID);

/**
 {
   _id: "65f2d40d6ea9c4b647755929"
  payment: "Thẻ VISA/MASTERCARD"
  express:  {"comment": "Dự kiến giao hàng 22/3 - 25/3", "id": 1, "price": 15000, "title": "Gia hàng nhanh"}
  listproduct: []
  namePayOrder: "1231312312"
  emailPayOrder: "12312312123"
  addressPayOrder: "124131231312"
  phonenumberPayOrder: "2423423423"
  }  
*/
router.post('/addorder', orderController.addOrder)
router.get('/getallorder', orderController.getOrer)
router.get('/updatestatus/', orderController.updateStatus);
module.exports = router;
