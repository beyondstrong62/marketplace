import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import useGlobalUserObject from '../store/store';
import API_URL from '../constants';

const ProductUploadForm = () => {
  const [currentUser,setCurrentUser]=useState(null);
  useEffect(() => {
    getCurrentUser();
    
  }, []);

  useEffect(()=>{
    if (currentUser?._id) {
      setFormData(prev => ({
        ...prev,
        user: currentUser._id
      }));
    }
    // console.log(currentUser?._id);
  },[currentUser])
  
  const getCurrentUser=async ()=>{
    try {  
      const res = await axios.get(
        `${API_URL}/api/v1/get-user`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      if(!res){
        throw new error("User Fetching Failed");
      }
      
      const data= await res?.data;
      setCurrentUser(data?.user);
      
      
      
    } catch (error) {
      console.error(error);
      handleLogout();
    }
    finally{
    }
  }


  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    location: '',
    condition: 'used',
    negotiable: false,
    user: currentUser?._id || ''
  });
  
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    
    if (files.length + newFiles.length > 4) {
      setError('You can upload maximum 4 images');
      return;
    }
    
    const uniqueNewFiles = newFiles.filter(
      newFile => !files.some(existingFile => existingFile.name === newFile.name)
    );
    
    setFiles(prevFiles => [...prevFiles, ...uniqueNewFiles]);
    setError('');
    e.target.value = '';
  };

  const handleAddMoreImages = () => {
    fileInputRef.current.click();
  };

  const handleRemoveImage = (index) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
    if (files.length === 0) {
      setError('Please upload at least one image');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const formDataToSend = new FormData();
      
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });
      
      files.forEach(file => {
        formDataToSend.append('images', file);
      });
      
      const product=await axios.post(`${API_URL}/api/v1/add-product`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      const productID=product?.data?.product?._id;

      if (productID && currentUser?._id) {
        await axios.patch(`${API_URL}/api/v1/${currentUser._id}/add-product`, 
          { productId: productID },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              'Content-Type': 'application/json'
            }
          }
        );
      }
      
      setSuccess(true);
      setFormData({
        title: '',
        description: '',
        price: '',
        category: '',
        location: '',
        condition: 'used',
        negotiable: false,
        user: currentUser?._id || ''
      });
      setFiles([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload product');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 py-6 px-8">
        <h2 className="text-3xl font-bold text-white">List Your Item For Sale</h2>
        <p className="text-blue-100 mt-2">Fill in the details below to post your ad</p>
      </div>

      {/* Notification area */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 m-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 m-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">Product uploaded successfully!</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        {/* Image upload section */}
        <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Product Images</h3>
          
          <input 
            type="file" 
            ref={fileInputRef}
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Display selected images */}
            {files.map((file, index) => (
              <div key={index} className="relative group rounded-lg overflow-hidden shadow-sm">
                <img 
                  src={URL.createObjectURL(file)} 
                  alt={file.name} 
                  className="w-full h-32 object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    type="button" 
                    onClick={() => handleRemoveImage(index)}
                    className="bg-red-600 text-white p-1 rounded-full"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <span className="absolute bottom-1 right-2 text-xs font-medium bg-gray-900 bg-opacity-70 text-white px-2 py-1 rounded">
                  {index + 1}/4
                </span>
              </div>
            ))}
            
            {/* Add more button */}
            {files.length < 4 && (
              <button
                type="button"
                onClick={handleAddMoreImages}
                className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center h-32 bg-white hover:bg-blue-50 hover:border-blue-500 transition-colors duration-200"
              >
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                <span className="mt-2 text-sm text-gray-500">Add Image</span>
              </button>
            )}
          </div>
          <p className="mt-3 text-xs text-gray-500">Upload up to 4 images. First image will be used as the cover.</p>
        </div>

        {/* Item details section */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Item Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g. iPhone 13 Pro 128GB"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price <span className="text-red-500">*</span></label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">₹</span>
                </div>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                placeholder="Describe your item's condition, features, and why you're selling it..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select category</option>
                <option value="electronics">Electronics</option>
                <option value="furniture">Furniture</option>
                <option value="clothing">Clothing</option>
                <option value="books">Books</option>
                <option value="vehicles">Vehicles</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. San Francisco, CA"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
              <div className="flex gap-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="condition"
                    value="new"
                    checked={formData.condition === "new"}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">New</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="condition"
                    value="used"
                    checked={formData.condition === "used"}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Used</span>
                </label>
              </div>
            </div>

            <div>
              <div className="flex items-center h-10">
                <input
                  type="checkbox"
                  name="negotiable"
                  checked={formData.negotiable}
                  onChange={handleChange}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">Price is negotiable</label>
              </div>
            </div>
          </div>
        </div>

        {/* Submit button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="px-8 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </div>
            ) : (
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                </svg>
                Post Ad
              </div>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductUploadForm;