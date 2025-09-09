import { create } from "zustand";

const useGlobalUserObject=create((set)=>({
    user:null,
    isLoggedIn:false,
    setLogin: ({ token, user }) => {
        localStorage.setItem("token", token);
        localStorage.setItem("currUser", JSON.stringify(user));
        set({ isLoggedIn: true, user: { ...user, token } });
      },
    setLogout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("currUser")
        set({ isLoggedIn: false, user: null });
      },
    loadUserFromStorage: () => {
        const token = localStorage.getItem("token");
        const user = localStorage.getItem("currUser");
      
        if (token && user) {
          set({
            isLoggedIn: true,
            user: { ...JSON.parse(user), token },
          });
        } else {
          set({ isLoggedIn: false, user: null });
        }
      },
}))

export default useGlobalUserObject