import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ImageCarousel = ({ product, currentSlide = 0, onSlideChange, isModal = false }) => {
  const images = product.images || [];
  const imageCount = images.length;
  
  // Handle swipe functionality
  const touchStartXRef = useRef(null);
  
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
  };
  
  const handleTouchEnd = (e) => {
    if (!touchStartXRef.current) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;
    
    // Minimum swipe distance (in pixels)
    const minSwipeDistance = 50;
    
    if (Math.abs(diff) >= minSwipeDistance) {
      if (diff > 0) {
        // Swiped left - go to next slide
        const nextSlide = (currentSlide + 1) % imageCount;
        onSlideChange(nextSlide);
      } else {
        // Swiped right - go to previous slide
        const prevSlide = (currentSlide - 1 + imageCount) % imageCount;
        onSlideChange(prevSlide);
      }
    }
    
    // Reset the touch start reference
    touchStartXRef.current = null;
  };

  if (imageCount === 0) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-gray-200 ${isModal ? 'rounded-lg' : ''}`}>
        <span className="text-gray-500">No image</span>
      </div>
    );
  }
  
  if (imageCount === 1) {
    return (
      <img 
        src={images[0]}
        alt={product.title || "Product"}
        className={`w-full h-full object-cover ${isModal ? 'rounded-lg' : ''}`}
        onError={(e) => {
          e.target.src = "/api/placeholder/400/300";
          e.target.alt = "Image not available";
        }}
      />
    );
  }
  
  return (
    <div 
      className={`relative w-full h-full ${isModal ? 'rounded-lg overflow-hidden' : ''}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Images */}
      <div className="relative w-full h-full overflow-hidden">
        {images.map((image, index) => (
          <div 
            key={index}
            className={`absolute top-0 left-0 w-full h-full transition-opacity duration-300 ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <img 
              src={image}
              alt={`${product.title || "Product"} - ${index + 1}`}
              className={`w-full h-full object-cover ${isModal ? 'rounded-lg' : ''}`}
              onError={(e) => {
                e.target.src = "/api/placeholder/400/300";
                e.target.alt = "Image not available";
              }}
            />
          </div>
        ))}
      </div>
      
      {/* Navigation arrows */}
      <button 
        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-40 hover:bg-opacity-60 rounded-full p-1 text-white z-20"
        onClick={(e) => {
          e.stopPropagation();
          const prevSlide = (currentSlide - 1 + imageCount) % imageCount;
          onSlideChange(prevSlide);
        }}
      >
        <ChevronLeft size={16} />
      </button>
      
      <button 
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-40 hover:bg-opacity-60 rounded-full p-1 text-white z-20"
        onClick={(e) => {
          e.stopPropagation();
          const nextSlide = (currentSlide + 1) % imageCount;
          onSlideChange(nextSlide);
        }}
      >
        <ChevronRight size={16} />
      </button>
      
      {/* Slide indicators */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-20">
        {images.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full ${
              index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-40'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onSlideChange(index);
            }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageCarousel;