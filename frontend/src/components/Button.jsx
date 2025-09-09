import React from 'react';

const Button = ({ children,prop }) => {
  return (
    <button  className='px-6 py-3 bg-blue-600 text-white rounded-xl w-fit
    flex items-center justify-center transition-all duration-300 
    hover:scale-105 hover:bg-gradient-to-r hover:from-blue-600 
    hover:to-purple-400 font-medium cursor-pointer gap-2 shadow-md min-w-[10vw]'>
      {children}
    </button>
  );
};

export default Button;
