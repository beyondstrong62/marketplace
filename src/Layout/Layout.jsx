import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useGlobalUserObject from "../store/store";
import axios from "axios";
import API_URL from "../constants";

// automatic logout after token expiration:

const Layout = ({ children }) => {
  const location = useLocation();
  const setLogout=useGlobalUserObject((state)=>state.setLogout)

  const user = useGlobalUserObject((state) => state.user);
  const loadUserFromStorage=useGlobalUserObject((state)=>state.loadUserFromStorage);
  const isLoggedIn = !!user;
  const navigate=useNavigate();

  
  const handleLogout=()=>{
    // setOpen(false);//for mobile devices
    setLogout();
    alert("Logout Successful")
  }

  useEffect(() => {
    // getCurrentUser();
    loadUserFromStorage();
  }, []);
  
  const getCurrentUser=async ()=>{
    
    // setLoadingForUser(true);
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
      console.log(data);

      // setUser(data);
      // localStorage.setItem("currUser",JSON.stringify(data));
      loadUserFromStorage();
      
      
    } catch (error) {
      console.error(error);
      // alert("Token Expired Or Invalid User Re login.");
      handleLogout();
    }
    finally{
      // setLoadingForUser(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-gradient-to-r from-gray-900 to-black text-white py-5 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-3xl font-extrabold tracking-tight hover:scale-125 duration-100">
              <Link to="/" className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700  transition-all duration-300">
                CU - <span className="text-white ">Market</span>
              </Link>
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
          <Link
              to="/"
              className={`font-medium text-base transition-all duration-300 hover:text-red-400 ${
                location.pathname === "/" ? "text-red-500 border-b-2 border-red-500 pb-1" : "text-gray-100"
              }`}
            >
              All Products
            </Link>
            {!isLoggedIn ?
            <Link
              to="/login"
              className={`font-medium text-base transition-all duration-300 hover:text-red-400 ${
                location.pathname === "/login" ? "text-red-500 border-b-2 border-red-500 pb-1" : "text-gray-100"
              }`}
            >
              Login
            </Link> : <Link
              to="/add-product"
              className={`font-medium text-base transition-all duration-300 hover:text-red-400 ${
                location.pathname === "/add-product" ? "text-red-500 border-b-2 border-red-500 pb-1" : "text-gray-100"
              }`}
            >
              Add Product
            </Link>}


            {!isLoggedIn && <Link
              to="/signup"
              className={`font-medium text-base transition-all duration-300 hover:text-red-400 ${
                location.pathname === "/signup" ? "text-red-500 border-b-2 border-red-500 pb-1" : "text-gray-100"
              }`}
            >
              Sign Up
            </Link>}

            {isLoggedIn && <Link
              to="/my-profile"
              className={`font-medium text-base transition-all duration-300 hover:text-red-400 ${
                location.pathname === "/my-profile" ? "text-red-500 border-b-2 border-red-500 pb-1" : "text-gray-100"
              }`}
            >
              My Profile
            </Link>}

            {isLoggedIn && <Link
              onClick={handleLogout}
              to="/login"
              className={`font-medium text-base transition-all duration-300 hover:text-red-400 ${
                location.pathname === "/logout" ? "text-red-500 border-b-2 border-red-500 pb-1" : "text-gray-100"
              }`}
            >
              Logout
            </Link>}
          </div>
          <div className="md:hidden">
            <MobileMenu handleLogout={handleLogout} isLoggedIn={isLoggedIn} />
          </div>
        </div>
      </nav>

      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
      
      <footer className="bg-gray-900 text-gray-400 py-6 text-center text-sm">
        <div className="max-w-7xl mx-auto px-4">
          © {new Date().getFullYear()} CU - Market. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

const MobileMenu = ({handleLogout,isLoggedIn}) => {
  const [open, setOpen] = React.useState(false);
  const location = useLocation();

  return (
    <div className="relative">
      <button
        className="text-white focus:outline-none"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {open ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-48 rounded-md shadow-lg py-2 bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
          <Link
            to="/"
            className={`block px-4 py-3 text-sm transition duration-150 ease-in-out ${
              location.pathname === "/" 
              ? "bg-gray-700 text-red-500" 
              : "text-gray-100 hover:bg-gray-700"
            }`}
            onClick={() => setOpen(false)}
          >
            All Products
          </Link>
          {!isLoggedIn ?<Link
            to="/login"
            className={`block px-4 py-3 text-sm transition duration-150 ease-in-out ${
              location.pathname === "/login" 
              ? "bg-gray-700 text-red-500" 
              : "text-gray-100 hover:bg-gray-700"
            }`}
            onClick={() => setOpen(false)}
          >
            Login
          </Link>: <Link
            to="/add-product"
            className={`block px-4 py-3 text-sm transition duration-150 ease-in-out ${
              location.pathname === "/add-product" 
              ? "bg-gray-700 text-red-500" 
              : "text-gray-100 hover:bg-gray-700"
            }`}
            onClick={() => setOpen(false)}
          >
            Add Product
          </Link>}
          {!isLoggedIn && <Link
            to="/signup"
            className={`block px-4 py-3 text-sm transition duration-150 ease-in-out ${
              location.pathname === "/signup" 
              ? "bg-gray-700 text-red-500" 
              : "text-gray-100 hover:bg-gray-700"
            }`}
            onClick={() => setOpen(false)}
          >
            Sign Up
          </Link>}
          {isLoggedIn && <Link
            to="/my-profile"
            className={`block px-4 py-3 text-sm transition duration-150 ease-in-out ${
              location.pathname === "/my-profile" 
              ? "bg-gray-700 text-red-500" 
              : "text-gray-100 hover:bg-gray-700"
            }`}
            onClick={() => setOpen(false)}
          >
            My Profile
          </Link>}

          {isLoggedIn && <Link
            to="/login"
            className={`block px-4 py-3 text-sm transition duration-150 ease-in-out ${
              location.pathname === "/signup" 
              ? "bg-gray-700 text-red-500" 
              : "text-gray-100 hover:bg-gray-700"
            }`}
            onClick={handleLogout}
          >
            Log out
          </Link>}
          
        </div>
      )}
    </div>
  );
};

export default Layout;