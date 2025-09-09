import React from 'react';
import ProductCard from '../components/ProductCard';

const ProductList = ({ 
  loading, 
  filteredProducts, 
  handleProductClick, 
  currentSlides, 
  handleSlideChange 
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold text-gray-700">No products found</h2>
        <p className="text-gray-500 mt-2">Try adjusting your search or filter criteria</p>
      </div>
    );
  }

  return (
    <>
      <p className="mb-4 text-gray-600">{filteredProducts.length} items found</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard 
            key={product._id}
            product={product}
            onClick={handleProductClick}
            currentSlide={currentSlides[product._id] || 0}
            onSlideChange={handleSlideChange}
          />
        ))}
      </div>
    </>
  );
};

export default ProductList;