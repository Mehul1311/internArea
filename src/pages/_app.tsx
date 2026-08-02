import Footer from "@/Components/Fotter";
import Navbar from "@/Components/Navbar";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { store } from "../store/store";
import { Provider, useDispatch } from "react-redux";
import { useEffect } from "react";
import { auth } from "@/firebase/firebase";
import { login, logout } from "@/Feature/Userslice";
import { apiClient } from "@/api/axios";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
export default function App({ Component, pageProps }: AppProps) {
  function AuthListener() {
    const dispatch = useDispatch();

    useEffect(() => {
      const syncBackendUser = async (authuser: any) => {
        if (authuser) {
          try {
            // Because axios interceptor automatically attaches the Firebase token,
            // this call will verify the Firebase token on the backend, 
            // auto-create the user in Postgres if missing, and return the Postgres ID.
            const res = await apiClient.get('/auth/me');
            if (res.data) {
              const userData = {
                id: res.data.id, // Important: This is the Integer Postgres ID
                uid: res.data.id,
                username: res.data.username,
                email: res.data.username,
                name: authuser.displayName || res.data.username?.split('@')[0],
                phone: res.data.phone || authuser.phoneNumber,
                role_id: res.data.role_id,
                photo: authuser.photoURL || res.data.profile_picture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop"
              };
              localStorage.setItem('app_user', JSON.stringify(userData));
              dispatch(login(userData));
            }
          } catch (err) {
            console.error("Failed to sync backend user:", err);
            dispatch(logout());
            localStorage.removeItem('app_user');
          }
        } else {
          dispatch(logout());
          localStorage.removeItem('app_user');
        }
      };

      // Restore initial session optimistically for fast rendering
      const storedUser = localStorage.getItem('app_user');
      if (storedUser) {
        try {
          dispatch(login(JSON.parse(storedUser)));
        } catch (e) {}
      }

      const unsubscribe = auth.onAuthStateChanged((authuser) => {
        // Automatically sync with backend when Firebase auth state changes
        syncBackendUser(authuser);
      });

      return () => unsubscribe();
    }, [dispatch]);

    return null;
  }

  return (
    <Provider store={store}>
      <AuthListener />
      <div className="bg-white">
        <ToastContainer/>
        <Navbar />
        <Component {...pageProps} />
        <Footer />
      </div>
    </Provider>
  );
}
