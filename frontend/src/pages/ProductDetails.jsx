import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import API_URL from '../constants';

const ProductDetails = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const { productId } = useParams();
  const navigate = useNavigate();
  
  // Modal state
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    description: '',
    category: '',
    condition: '',
    location: '',
    negotiable: false,
    images: []
  });
  
  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/v1/products/${productId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }
        });
        
        if (res.data && res.data.product) {
          setProduct(res.data.product);
          // Initialize form data with product details
          setFormData({
            title: res.data.product.title,
            price: res.data.product.price,
            description: res.data.product.description,
            category: res.data.product.category,
            condition: res.data.product.condition,
            location: res.data.product.location,
            negotiable: res.data.product.negotiable,
            images: res.data.product.images
          });
        } else {
          setError('Product not found');
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError(err.response?.data?.message || 'Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    const fetchCurrentUser = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/v1/get-user`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        });
        
        if (res && res.data) {
          setCurrentUser(res.data.user);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (productId) {
      fetchProductDetails();
      fetchCurrentUser();
    }
  }, [productId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handlePrevImage = () => {
    setCurrentImageIndex(prevIndex => 
      prevIndex === 0 ? product.images.length - 1 : prevIndex - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex(prevIndex => 
      prevIndex === product.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setFormError('');
    setFormSuccess('');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleFileChange = (e) => {
    // This is a simplified version - in a real implementation, 
    // you would handle file uploads properly
    const files = Array.from(e.target.files);
    setFormData({
      ...formData,
      newImages: files // Store the new files separately
    });
  };

  const handleRemoveImage = (index) => {
    const updatedImages = [...formData.images];
    updatedImages.splice(index, 1);
    setFormData({
      ...formData,
      images: updatedImages
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');
    setFormSuccess('');

    try {
      // Create form data for multipart/form-data if there are new images
      const data = new FormData();
      data.append('title', formData.title);
      data.append('price', formData.price);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('condition', formData.condition);
      data.append('location', formData.location);
      data.append('negotiable', formData.negotiable);
      
      // Append existing images as JSON
      data.append('existingImages', JSON.stringify(formData.images));
      
      // Append new images if any
      if (formData.newImages && formData.newImages.length > 0) {
        formData.newImages.forEach(file => {
          data.append('images', file);
        });
      }

      const res = await axios.put(`${API_URL}/api/v1/products/${productId}`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data && res.data.product) {
        setProduct(res.data.product);
        setFormSuccess('Product updated successfully!');
        
        // Close modal after a short delay
        setTimeout(() => {
          setShowEditModal(false);
          setFormSuccess('');
        }, 2000);
      }

      alert("Update Successful")
      
    } catch (err) {
      console.error('Error updating product:', err);
      setFormError(err.response?.data?.message || 'Failed to update product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/v1/products/${productId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      });
      navigate('/my-profile', { state: { message: 'Product deleted successfully' } });
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(err.response?.data?.message || 'Failed to delete product');
      setDeleteConfirm(false);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(false);
  };

  const isOwner = () => {
    return currentUser && product && currentUser._id === product.user;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button 
            onClick={() => navigate(-1)}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p>Product not found</p>
          <button 
            onClick={() => navigate(-1)}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="md:flex">
            {/* Product Images Carousel */}
            <div className="md:w-1/2">
              {product.images && product.images.length > 0 ? (
                <div className="relative h-96">
                  <img 
                    src={product.images[currentImageIndex]} 
                    alt={`${product.title} - ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Navigation arrows */}
                  {product.images.length > 1 && (
                    <>
                      <button 
                        onClick={handlePrevImage}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-2"
                        aria-label="Previous image"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button 
                        onClick={handleNextImage}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full p-2"
                        aria-label="Next image"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div className="h-96 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">No image available</span>
                </div>
              )}

              {/* Thumbnail images */}
              {product.images && product.images.length > 1 && (
                <div className="flex p-4 space-x-2 overflow-x-auto">
                  {product.images.map((image, index) => (
                    <div 
                      key={index} 
                      className={`w-20 h-20 cursor-pointer ${currentImageIndex === index ? 'border-2 border-blue-500' : 'border border-gray-200'}`}
                      onClick={() => setCurrentImageIndex(index)}
                    >
                      <img 
                        src={image} 
                        alt={`${product.title} - ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Product Details */}
            <div className="md:w-1/2 p-6">
              <div className="flex justify-between items-start">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.title}</h1>
                
                {/* Edit and Delete buttons if user is the owner */}
                {isOwner() && (
                  <div className="flex space-x-2">
                    <button 
                      onClick={handleEdit}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-1 px-3 rounded text-sm"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={handleDelete}
                      className="bg-red-500 hover:bg-red-600 text-white font-medium py-1 px-3 rounded text-sm"
                    >
                      {deleteConfirm ? 'Confirm' : 'Delete'}
                    </button>
                    {deleteConfirm && (
                      <button 
                        onClick={cancelDelete}
                        className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-1 px-3 rounded text-sm"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                )}
              </div>
              
              <p className="text-2xl font-bold text-blue-600 mb-4">₹{product.price}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-gray-100 text-gray-800 text-sm font-medium px-2.5 py-0.5 rounded">
                  {product.category}
                </span>
                <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded">
                  {product.condition}
                </span>
                {product.negotiable && (
                  <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                    Negotiable
                  </span>
                )}
              </div>
              
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-700 mb-2">Description</h2>
                <p className="text-gray-600">{product.description}</p>
              </div>
              
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-700 mb-2">Location</h2>
                <p className="text-gray-600">{product.location}</p>
              </div>
              
              <div className="mb-6">
                <p className="text-sm text-gray-500">Listed on {formatDate(product.createdAt)}</p>
              </div>
              
              <div className="flex flex-col space-y-3">
                {!isOwner() && (
                  <button 
                    className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
                  >
                    Contact Seller
                  </button>
                )}
                <button 
                  onClick={() => navigate(-1)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded"
                >
                  Back to Listings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Product Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Edit Product</h2>
              <button 
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {formError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {formError}
              </div>
            )}

            {formSuccess && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                {formSuccess}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a category</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Books">Books</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Vehicles">Vehicles</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">
                    Condition
                  </label>
                  <select
                    id="condition"
                    name="condition"
                    value={formData.condition}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select condition</option>
                    <option value="New">New</option>
                    <option value="Used">Used</option>
                    
                  </select>
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="negotiable"
                    name="negotiable"
                    checked={formData.negotiable}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="negotiable" className="ml-2 block text-sm text-gray-700">
                    Price is negotiable
                  </label>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Images
                  </label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {formData.images && formData.images.length > 0 ? (
                      formData.images.map((image, index) => (
                        <div key={index} className="relative w-20 h-20">
                          <img 
                            src={image} 
                            alt={`Product image ${index + 1}`}
                            className="w-full h-full object-cover border border-gray-200 rounded"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                          >
                            ×
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No images</p>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="newImages" className="block text-sm font-medium text-gray-700 mb-1">
                    Add New Images
                  </label>
                  <input
                    type="file"
                    id="newImages"
                    name="newImages"
                    onChange={handleFileChange}
                    multiple
                    accept="image/*"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    You can select multiple images. Max 5MB per image.
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-8">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? 'Updating...' : 'Update Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;