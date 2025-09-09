// src/components/ProductCard.jsx




// src/components/ImageCarousel.jsx


// src/components/SearchBar.jsx




// src/components/FilterPanel.jsx


// src/components/ProductModal.jsx


// src/components/ProductList.jsx


// src/pages/Homepage.jsx
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import ProductList from '../components/ProductList';
import ProductModal from '../components/ProductModal';
import API_URL from '../constants';

const Homepage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    condition: '',
    priceRange: { min: '', max: '' },
    location: '',
    negotiable: null
  });
  
  // Modal state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Store current slide index for each product
  const [currentSlides, setCurrentSlides] = useState({});
  // Store timer references for auto-slideshow
  const timersRef = useRef({});

  const categories = ["furniture", "electronics", "clothing", "books", "other"];
  const conditions = ["new", "used"];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/v1/get-products`);
        setProducts(res.data);
        setFilteredProducts(res.data);
        
        // Initialize slide positions for all products
        const initialSlides = {};
        res.data.forEach(product => {
          initialSlides[product._id] = 0;
        });
        setCurrentSlides(initialSlides);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    // Clean up all timers when component unmounts
    return () => {
      Object.values(timersRef.current).forEach(timer => clearTimeout(timer));
    };
  }, []);

  useEffect(() => {
    // Apply filters and search whenever they change
    applyFiltersAndSearch();
  }, [searchTerm, filters, products]);

  // Setup slideshows for products with multiple images
  useEffect(() => {
    // Clear all existing timers first
    Object.values(timersRef.current).forEach(timer => clearTimeout(timer));
    timersRef.current = {};
    
    // Setup auto-slideshow for each product with multiple images
    filteredProducts.forEach(product => {
      if (product.images && product.images.length > 1) {
        setupSlideshow(product._id, product.images.length);
      }
    });
    
    return () => {
      // Clean up timers when filtered products change
      Object.values(timersRef.current).forEach(timer => clearTimeout(timer));
    };
  }, [filteredProducts]);

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showModal]);

  const setupSlideshow = (productId, imageCount) => {
    const nextSlide = () => {
      setCurrentSlides(prev => {
        const nextIndex = ((prev[productId] || 0) + 1) % imageCount;
        return { ...prev, [productId]: nextIndex };
      });
      
      // Schedule next slide
      timersRef.current[productId] = setTimeout(() => {
        nextSlide();
      }, 3000);
    };
    
    // Start the slideshow loop
    timersRef.current[productId] = setTimeout(nextSlide, 3000);
  };

  const handleSlideChange = (productId, slideIndex) => {
    // Clear existing timer for this product
    if (timersRef.current[productId]) {
      clearTimeout(timersRef.current[productId]);
    }
    
    // Set current slide directly
    setCurrentSlides(prev => ({
      ...prev, 
      [productId]: slideIndex
    }));
    
    // Get the image count for this product
    const product = filteredProducts.find(p => p._id === productId);
    const imageCount = product?.images?.length || 0;
    
    // Reset the timer for this product
    timersRef.current[productId] = setTimeout(() => {
      setCurrentSlides(prev => ({
        ...prev,
        [productId]: (slideIndex + 1) % imageCount
      }));
      
      // Restart the slideshow
      setupSlideshow(productId, imageCount);
    }, 5000); // Longer pause after manual navigation
  };

  const applyFiltersAndSearch = () => {
    let result = [...products];

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        product => 
          product.title?.toLowerCase().includes(term) || 
          product.description?.toLowerCase().includes(term) ||
          product.category?.toLowerCase().includes(term)
      );
    }

    // Apply category filter
    if (filters.category) {
      result = result.filter(product => 
        product.category?.toLowerCase() === filters.category.toLowerCase()
      );
    }

    // Apply condition filter
    if (filters.condition) {
      result = result.filter(product => 
        product.condition?.toLowerCase() === filters.condition.toLowerCase()
      );
    }

    // Apply price range filter
    if (filters.priceRange.min !== '') {
      result = result.filter(product => product.price >= Number(filters.priceRange.min));
    }
    if (filters.priceRange.max !== '') {
      result = result.filter(product => product.price <= Number(filters.priceRange.max));
    }

    // Apply location filter
    if (filters.location) {
      result = result.filter(product => 
        product.location?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Apply negotiable filter
    if (filters.negotiable !== null) {
      result = result.filter(product => product.negotiable === filters.negotiable);
    }

    setFilteredProducts(result);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (name, value) => {
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFilters(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const resetFilters = () => {
    setFilters({
      category: '',
      condition: '',
      priceRange: { min: '', max: '' },
      location: '',
      negotiable: null
    });
    setSearchTerm('');
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  const handleModalSlideChange = (slideIndex) => {
    if (!selectedProduct) return;
    handleSlideChange(selectedProduct._id, slideIndex);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Marketplace</h1>
      
      {/* Search and Filter section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <SearchBar searchTerm={searchTerm} onSearchChange={handleSearchChange} />
          <FilterPanel 
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            filters={filters}
            handleFilterChange={handleFilterChange}
            resetFilters={resetFilters}
            categories={categories}
            conditions={conditions}
          />
        </div>
      </div>
      
      {/* Product listing */}
      <ProductList 
        loading={loading}
        filteredProducts={filteredProducts}
        handleProductClick={handleProductClick}
        currentSlides={currentSlides}
        handleSlideChange={handleSlideChange}
      />
      
      {/* Product Detail Modal */}
      {showModal && selectedProduct && (
        <ProductModal 
          product={selectedProduct}
          onClose={closeModal}
          currentSlide={currentSlides[selectedProduct._id] || 0}
          onSlideChange={handleModalSlideChange}
        />
      )}
    </div>
  );
};

export default Homepage;