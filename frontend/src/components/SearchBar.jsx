import React from 'react';
import { Search } from 'lucide-react';
const SearchBar = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="relative flex-1">
      <input
        type="text"
        placeholder="Search for products..."
        value={searchTerm}
        onChange={onSearchChange}
        className="w-full p-3 pl-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <Search className="absolute left-3 top-3 text-gray-400" size={20} />
    </div>
  );
};

export default SearchBar;