import { Router } from "express";
import  {registerUser, loginUser, logoutUser, getUser, addProductToUser, getUserById, resetPassword } from "../Controllers/auth.controller.js";
import { verifyJWT } from "../Middleware/auth.middleware.js";
import { addProduct, deleteProduct, getProductById, getProducts, getUserProducts, updateProduct } from "../Controllers/product.controller.js";
import { upload } from "../Middleware/multer.middleware.js";

const router=Router();


// signup, login, logout routes
router.post('/signup',registerUser);
router.post('/login',loginUser);
router.get('/logout',verifyJWT,logoutUser);
router.get('/get-user',verifyJWT,getUser)
router.get('/users/:userId', getUserById);
router.post('/reset-password',verifyJWT,resetPassword);


// products
router.post('/add-product',verifyJWT,upload.array("images", 4),addProduct); 
router.get('/get-products',getProducts);
router.patch('/:userId/add-product',verifyJWT,addProductToUser)
router.get('/products/user', verifyJWT, getUserProducts); // New route for user products
router.get('/products/:productId', getProductById); // New route for getting product by ID
router.delete('/products/:productId', verifyJWT, deleteProduct);
router.put('/products/:productId', verifyJWT, upload.array('images'), updateProduct);








export default router;