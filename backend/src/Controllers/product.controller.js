import Product from '../Models/product.model.js';
import uploadOnCloudinary from '../Utils/cloudinary.js';
import fs from "fs";
import User from '../Models/user.model.js'

const addProduct = async (req, res) => {
    try {
        // Check if files were uploaded
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: "At least one image is required" 
            });
        }

        // Check if more than 4 images were uploaded
        if (req.files.length > 4) {
            // Delete the temporarily stored files
            req.files.forEach(async (file) => {
                await fs.promises.unlink(file.path);
            });
            return res.status(400).json({ 
                success: false, 
                message: "Maximum 4 images allowed" 
            });
        }

        // Upload images to Cloudinary
        const imageUploadPromises = req.files.map(async (file) => {
            const result = await uploadOnCloudinary(file.path);
            return result?.url || null;
        });

        // Wait for all uploads to complete
        const imageUrls = await Promise.all(imageUploadPromises);
        
        // Filter out any failed uploads
        const validImageUrls = imageUrls.filter(url => url !== null);

        // Check if we have at least one valid image
        if (validImageUrls.length === 0) {
            return res.status(500).json({ 
                success: false, 
                message: "Failed to upload images to Cloudinary" 
            });
        }

        // Extract product data from request body
        const { 
            title, 
            description, 
            price, 
            category, 
            location,
            condition,
            negotiable,
            user
        } = req.body;

        // Create new product in database
        const product = await Product.create({
            title,
            description,
            price,
            category,
            location,
            condition: condition || 'used',
            negotiable: negotiable || false,
            user,
            images: validImageUrls
        });

        // Return success response
        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            product
        });

    } catch (error) {
        // Clean up any uploaded files if error occurs
        if (req.files) {
            req.files.forEach(async (file) => {
                try {
                    await fs.promises.unlink(file.path);
                } catch (err) {
                    console.error("Error deleting temporary file:", err);
                }
            });
        }

        console.error("Error creating product:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal server error",
            error: error.message 
        });
    }
};


const getProducts=async(req,res)=>{
    try {
        const products = await Product.find(); // You can add filters, sorting, or pagination here if needed
        res.status(200).json(products);
      } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Failed to fetch products' });
      }
}

const getUserProducts = async (req, res) => {
    try {
        const userId = req.user._id;
        
        if (!userId) {
            return res.status(400).json({ 
                success: false, 
                message: "User ID is required" 
            });
        }
        
        const products = await Product.find({ user: userId }).sort({ createdAt: -1 });
        
        return res.status(200).json({
            success: true,
            products,
            message: "User products fetched successfully"
        });
    } catch (error) {
        console.error("Error fetching user products:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Failed to fetch user products",
            error: error.message 
        });
    }
};

// Get specific product by ID
const getProductById = async (req, res) => {
    try {
        const { productId } = req.params;
        
        if (!productId) {
            return res.status(400).json({ 
                success: false, 
                message: "Product ID is required" 
            });
        }
        
        const product = await Product.findById(productId);
        
        if (!product) {
            return res.status(404).json({ 
                success: false, 
                message: "Product not found" 
            });
        }
        
        return res.status(200).json({
            success: true,
            product,
            message: "Product fetched successfully"
        });
    } catch (error) {
        console.error("Error fetching product:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Failed to fetch product",
            error: error.message 
        });
    }
};
const deleteProduct = async (req, res) => {
    try {
      const { productId } = req.params;
      const userId = req.user._id;
      
      // Find the product first
      const product = await Product.findById(productId);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found"
        });
      }
      
      // Check if the user is the owner
      if (product.user.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to delete this product"
        });
      }
      
      // Delete the product
      await Product.findByIdAndDelete(productId);

    //   we also need to delete product id from user's product array

    await User.findByIdAndUpdate(userId, {
        $pull: { products: productId }
      });
      
      return res.status(200).json({
        success: true,
        message: "Product deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete product",
        error: error.message
      });
    }
  };

  const updateProduct = async (req, res) => {
    try {
      const { productId } = req.params;
      const userId = req.user._id;
      
      // Find the product
      const product = await Product.findById(productId);
      
      // Check if product exists
      if (!product) {
        return res.status(404).json({ 
          success: false,
          message: 'Product not found' 
        });
      }
      
      // Check if user is the owner
      if (product.user.toString() !== userId.toString()) {
        return res.status(403).json({ 
          success: false,
          message: 'Not authorized to update this product' 
        });
      }
      
      // Process form data
      const { title, price, description, category, condition, location, negotiable } = req.body;
      
      // Handle existing images
      let images = [];
      if (req.body.existingImages) {
        images = JSON.parse(req.body.existingImages);
      }
      
      // Handle new uploaded images
      if (req.files && req.files.length > 0) {
        // Upload new images to Cloudinary
        const imageUploadPromises = req.files.map(async (file) => {
          const result = await uploadOnCloudinary(file.path);
          return result?.url || null;
        });
        
        // Wait for all uploads to complete
        const newImageUrls = await Promise.all(imageUploadPromises);
        
        // Filter out any failed uploads
        const validNewImageUrls = newImageUrls.filter(url => url !== null);
        
        // Combine existing images with new ones
        images = [...images, ...validNewImageUrls];
      }
      
      // Limit to maximum 4 images if needed
      if (images.length > 4) {
        images = images.slice(0, 4);
      }
      
      // Update the product
      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        {
          title,
          price,
          description,
          category,
          condition,
          location,
          negotiable: negotiable === 'true' || negotiable === true,
          images
        },
        { new: true }
      );
      
      // Return success response
      return res.status(200).json({ 
        success: true,
        message: 'Product updated successfully', 
        product: updatedProduct 
      });
    } catch (error) {
      // Clean up any uploaded files if error occurs
      if (req.files) {
        req.files.forEach(async (file) => {
          try {
            await fs.promises.unlink(file.path);
          } catch (err) {
            console.error("Error deleting temporary file:", err);
          }
        });
      }
      
      console.error('Error updating product:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Failed to update product',
        error: error.message 
      });
    }
  };
  
  export { addProduct, getProducts, getUserProducts, getProductById, deleteProduct,updateProduct };