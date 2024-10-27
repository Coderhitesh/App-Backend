const express = require('express')
const { register, login, logout, passwordChangeRequest, verifyOtpAndChangePassword, resendOtp, addDeliveryDetails, userDetails, GetDeliveryAddressOfUser, updateDeliveryAddress, getAllUsers, deleteUser, updateUser, updateUserDeactive, getSingleUserById, VerifyUser, VerifyresendOtp } = require('../Controllers/Usercontroller')
const { protect } = require('../Middleware/Protect')
const upload = require('../Middleware/Multer')
const { createCategory, getAllCategory, getSingleCategory, updateCategory, deleteCategory } = require('../Controllers/CategoryController')
const { createProduct, getAllProducts, getSingleProduct, updateProduct, deleteProduct } = require('../Controllers/ProductController')
const { createOrder, getAllOrder, updateOrderStatus, checkReferralCode, getMyOrderOnly } = require('../Controllers/OrderController')
const { getSingleVideo, updateVideo, deleteVideo, getAllVideo, createVideo } = require('../Controllers/VideoController')
const router = express.Router()

// user routers 

router.post('/Create-User', register)
router.post('/Login', login)
router.get('/Logout', protect, logout)
router.post('/Password-Change', passwordChangeRequest)
router.post('/Verify-Otp', verifyOtpAndChangePassword)
router.post('/resend-otp', resendOtp)
router.post('/verify-otps', protect, VerifyUser)
router.post('/resend-otps', protect, VerifyresendOtp)






router.post('/Add-Delivery-Address', protect, addDeliveryDetails)
router.get('/user-details', protect, userDetails)
router.get('/get-Delivery-Address', protect, GetDeliveryAddressOfUser)
router.post('/update-Delivery-Address', protect, updateDeliveryAddress)
router.get('/AllUser', getAllUsers)
router.delete('/delete-user/:_id', deleteUser)
router.put('/update-user/:_id', upload.single('userImage'), updateUser)
router.put('/update-user-deactive-status/:_id', updateUserDeactive)
router.get('/get-single-user/:_id', getSingleUserById)

// category route here 

router.post('/create-category', createCategory)
router.get('/get-all-category', getAllCategory)
router.get('/get-single-category/:_id', getSingleCategory)
router.put('/update-category/:_id', updateCategory)
router.delete('/delete-category/:_id', deleteCategory)

// product route 

router.post('/create-product', upload.single('images'), createProduct);         // Create product
router.get('/get-all-product', getAllProducts);                                 // Get all products
router.get('/get-single-product/:_id', getSingleProduct);                           // Get a single product by ID
router.put('/update-product/:_id', upload.single('images'), updateProduct);       // Update product by ID
router.delete('/delete-product/:_id', deleteProduct);

// order router 
router.post('/create-order',protect, createOrder);
router.get('/getMyOrderOnly', getMyOrderOnly);


router.get('/get-all-order', getAllOrder);
router.post('/checkReferralCode', checkReferralCode);

checkReferralCode
router.put('/update-orders-status/:orderId', updateOrderStatus);

// video router 

router.get('/create-video', createVideo);
router.get('/get-all-video/:_id', getAllVideo);
router.get('/get-single-video/:_id', getSingleVideo);
router.put('/update-video/:_id', updateVideo);
router.delete('/delete-video/:_id', deleteVideo);



module.exports = router;