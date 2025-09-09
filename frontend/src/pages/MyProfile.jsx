import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_URL from '../constants';

const MyProfile = () => {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  
  // Cancel tokens for API requests
  const cancelTokenRef = useRef(null);
  const resetCancelTokenRef = useRef(null);
  // Timeout refs for cleanup
  const successTimeoutRef = useRef(null);
  
  const navigate = useNavigate();

  // Get auth token once instead of on every request
  const getAuthHeader = useCallback(() => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    };
  }, []);

  const fetchUserData = useCallback(async () => {
    // Cancel previous request if it exists
    if (cancelTokenRef.current) {
      cancelTokenRef.current.cancel('Operation canceled due to new request.');
    }
    
    // Create a new cancel token
    cancelTokenRef.current = axios.CancelToken.source();
    
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_URL}/api/v1/get-user`,
        {
          ...getAuthHeader(),
          cancelToken: cancelTokenRef.current.token
        }
      );
      
      if (!res || !res.data) {
        throw new Error("User Fetching Failed");
      }
      
      setUser(res.data.user);
      
      // Only fetch products if user has products
      if (res.data.user.products && res.data.user.products.length > 0) {
        await fetchUserProducts();
      } else {
        // If no products, set empty array to avoid unnecessary API call
        setProducts([]);
      }
    } catch (error) {
      if (!axios.isCancel(error)) {
        console.error("Error fetching user data:", error);
        setError("Failed to load profile data. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  }, [getAuthHeader]);

  const fetchUserProducts = useCallback(async () => {
    try {
      const res = await axios.get(
        `${API_URL}/api/v1/products/user`,
        {
          ...getAuthHeader(),
          cancelToken: cancelTokenRef.current.token
        }
      );
      
      if (res && res.data && res.data.products) {
        setProducts(res.data.products);
      }
    } catch (error) {
      if (!axios.isCancel(error)) {
        console.error("Error fetching user products:", error);
        // Don't set main error state, just log it to not disrupt the whole page
      }
    }
  }, [getAuthHeader]);

  // Initialize data on component mount
  useEffect(() => {
    fetchUserData();
    
    // Cleanup function
    return () => {
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel('Component unmounted');
      }
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, [fetchUserData]);

  const resetPassword = useCallback(async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    
    // Validation - moved to separate function for better organization
    const validationError = validatePasswordForm();
    if (validationError) {
      setPasswordError(validationError);
      return;
    }
    
    // Cancel previous request if it exists
    if (resetCancelTokenRef.current) {
      resetCancelTokenRef.current.cancel('Operation canceled due to new request.');
    }
    
    // Create a new cancel token
    resetCancelTokenRef.current = axios.CancelToken.source();
    
    try {
      setResetLoading(true);
      const res = await axios.post(
        `${API_URL}/api/v1/reset-password`,
        {
          currentPassword,
          newPassword
        },
        {
          ...getAuthHeader(),
          cancelToken: resetCancelTokenRef.current.token
        }
      );
      
      if (res.data.success) {
        setPasswordSuccess('Password updated successfully');
        // Clear form
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        // Close modal after 2 seconds
        if (successTimeoutRef.current) {
          clearTimeout(successTimeoutRef.current);
        }
        
        successTimeoutRef.current = setTimeout(() => {
          setShowResetModal(false);
          setPasswordSuccess('');
        }, 2000);
      }
    } catch (error) {
      if (!axios.isCancel(error)) {
        console.error("Error resetting password:", error);
        setPasswordError(error.response?.data?.message || 'Failed to reset password. Please try again.');
      }
    } finally {
      setResetLoading(false);
    }
  }, [currentPassword, newPassword, confirmPassword, getAuthHeader]);

  const validatePasswordForm = useCallback(() => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return 'All fields are required';
    }
    
    if (newPassword !== confirmPassword) {
      return 'New passwords do not match';
    }
    
    if (newPassword.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    
    return null;
  }, [currentPassword, newPassword, confirmPassword]);

  // Memoized formatter to avoid recreation on every render
  const formatDate = useCallback((dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  const handleProductClick = useCallback((productId) => {
    navigate(`/product/${productId}`);
  }, [navigate]);

  // Close modal and clear form
  const closeResetModal = useCallback(() => {
    setShowResetModal(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setPasswordSuccess('');
    
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
    }
  }, []);

  // Conditional rendering for loading state
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Conditional rendering for error state
  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button 
            onClick={fetchUserData}
            className="mt-4 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Conditional rendering for unauthenticated user
  if (!user) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p>Please log in to view your profile.</p>
          <button 
            onClick={() => navigate('/login')}
            className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start">
            <div className="bg-blue-500 rounded-full w-24 h-24 flex items-center justify-center text-white text-3xl font-bold mb-4 md:mb-0 md:mr-6">
              {user.name ? user.name.charAt(0).toUpperCase() : '?'}
            </div>
            
            <div className="text-center md:text-left">
              <h1 className="text-2xl font-bold text-gray-800">{user.name}</h1>
              <p className="text-gray-600">{user.email}</p>
              {user.phone && <p className="text-gray-600">{user.phone}</p>}
              <p className="text-gray-500 text-sm mt-2">Member since {formatDate(user.createdAt)}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  {user.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'User'}
                </span>
                <button 
                  onClick={() => setShowResetModal(true)} 
                  className="bg-green-100 hover:bg-green-200 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded transition-colors"
                >
                  Reset Password
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* My Products Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">My Products</h2>
            <span className="text-sm text-gray-500">{products.length} items</span>
          </div>
          
          {products.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">You haven't added any products yet.</p>
              <button 
                onClick={() => navigate('/add-product')}
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                Add Your First Product
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <div 
                  key={product._id} 
                  className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleProductClick(product._id)}
                >
                  <div className="h-48 bg-gray-200 overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <img 
                        src={product.images[0]} 
                        alt={product.title}
                        className="w-full h-full object-cover"
                        loading="lazy" // Add lazy loading for images
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-gray-800 mb-1 truncate">{product.title}</h3>
                    <p className="text-blue-600 font-medium">₹{product.price}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">{formatDate(product.createdAt)}</span>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded">
                        {product.condition}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Password Reset Modal - Using Portal would be even better */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Reset Password</h2>
            
            {passwordSuccess && (
              <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                <p>{passwordSuccess}</p>
              </div>
            )}
            
            {passwordError && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <p>{passwordError}</p>
              </div>
            )}
            
            <form onSubmit={resetPassword}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="currentPassword">
                  Current Password
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="currentPassword"
                  type="password"
                  placeholder="Enter your current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="newPassword">
                  New Password
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="newPassword"
                  type="password"
                  placeholder="Enter your new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
                  Confirm New Password
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors"
                  type="submit"
                  disabled={resetLoading}
                >
                  {resetLoading ? 'Updating...' : 'Update Password'}
                </button>
                <button
                  type="button"
                  onClick={closeResetModal}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProfile;