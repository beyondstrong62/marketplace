import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useGlobalUserObject from '../store/store';

export default function AuthLayout({ children, authentication = true }) {
  const navigate = useNavigate();
  const [loader, setLoader] = useState(true);

  const authStatus = useGlobalUserObject((state) => state.isLoggedIn);
  const loadUserFromStorage = useGlobalUserObject((state) => state.loadUserFromStorage);

  useEffect(() => {
    // Load user only once on mount
    loadUserFromStorage();
  }, []);
  


  useEffect(() => {
    // Navigate based on authStatus once it's loaded
    if (authentication && !authStatus) {
      navigate("/login");
    } else if (!authentication && authStatus) {
      navigate("/");
    } else {
      setLoader(false); // ✅ Show children only when routing decision is made
    }
  }, [authStatus, navigate, authentication]);

  return loader ? <h1 className="text-center mt-10 text-xl">Loading...</h1> : <>{children}</>;
}
