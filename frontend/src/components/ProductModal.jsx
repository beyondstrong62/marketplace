import React, { useState } from 'react';
import { X, MapPin, Phone, Mail } from 'lucide-react';
import ImageCarousel from '../components/ImageCarousel';

const ProductModal = ({ product, onClose, currentSlide, onSlideChange }) => {
  const [owner, setOwner] = useState(product.userDetails.user);
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  const handleContactSeller = () => {
    // Format phone number for WhatsApp (remove any non-digit characters)
    const phoneNumber = owner.phone.replace(/\D/g, '');
  
    // Add country code +91 explicitly
    const whatsappNumber = `91${phoneNumber}`;
  
    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Hello! I'm interested in your product "${product.title}" on the CU - Market.`;
  
    // Open WhatsApp in a new tab
    window.open(whatsappUrl, '_blank');
  };
  
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">{product.title}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Modal content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product images */}
            <div className="h-80 md:h-96 bg-gray-100 rounded-lg">
              <ImageCarousel 
                product={product} 
                currentSlide={currentSlide} 
                onSlideChange={onSlideChange}
                isModal={true}
              />
            </div>
            
            {/* Product details */}
            <div>
              {/* Price and condition */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold text-gray-900">₹{product.price}</span>
                  {product.negotiable && (
                    <span className="ml-2 text-sm text-green-600">(Negotiable)</span>
                  )}
                </div>
                <div className={`px-3 py-1 text-sm rounded-full ${
                  product.condition === 'new' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {product.condition}
                </div>
              </div>
              
              {/* Category */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500">Category</h3>
                <p className="text-gray-800 capitalize">{product.category}</p>
              </div>
              
              {/* Location */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500">Location</h3>
                <div className="flex items-center text-gray-800">
                  <MapPin size={16} className="mr-1" />
                  <span>{product.location}</span>
                </div>
              </div>
              
              {/* Description */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
                <p className="text-gray-800 whitespace-pre-line">{product.description}</p>
              </div>
              
              {/* Seller information */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Seller Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium mb-2">{owner.name}</p>
                  
                  <div className="flex items-center text-gray-700 mb-2">
                    <Phone size={16} className="mr-2" />
                    <span>{owner.phone}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-700">
                    <Mail size={16} className="mr-2" />
                    <span>{owner.email}</span>
                  </div>
                </div>
              </div>
              
              {/* Posted date */}
              <div className="text-gray-500 text-sm">
                Posted on {formatDate(product.createdAt)}
              </div>
              
              {/* Contact button */}
              <div className="mt-6">
                <button 
                  onClick={handleContactSeller}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="white" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  </svg>
                  Contact Seller via WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ProductModal);