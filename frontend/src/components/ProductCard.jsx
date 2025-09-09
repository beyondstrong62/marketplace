import React from 'react';
import { MapPin } from 'lucide-react';
import ImageCarousel from './ImageCarousel';

const ProductCard = ({ product, onClick, currentSlide, onSlideChange }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer"
      onClick={() => onClick(product)}
    >
      {/* Product image carousel */}
      <div className="relative h-48 bg-gray-100">
        <ImageCarousel 
          product={product} 
          currentSlide={currentSlide} 
          onSlideChange={(slideIndex) => onSlideChange(product._id, slideIndex)}
        />
      </div>
      
      {/* Product details */}
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h2 className="text-lg font-semibold text-gray-800 mb-1 truncate">{product.title}</h2>
          <div className={`px-2 py-1 text-xs rounded-full ${product.condition === 'new' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
            {product.condition}
          </div>
        </div>
        
        <div className="flex items-center text-gray-600 mb-2">
          <MapPin size={14} className="mr-1" />
          <span className="text-sm truncate">{product.location}</span>
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
        
        <div className="flex justify-between items-center">
          <div className="flex items-baseline">
            <span className="text-xl font-bold text-gray-900">₹{product.price}</span>
            {product.negotiable && (
              <span className="ml-1 text-xs text-green-600">(Negotiable)</span>
            )}
          </div>
          <span className="text-xs text-gray-500">{formatDate(product.createdAt)}</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;