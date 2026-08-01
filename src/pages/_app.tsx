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
      const restoreSession = async () => {
        const storedUser = localStorage.getItem('app_user');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            dispatch(login(parsedUser));
          } catch (e) {}
        }

        try {
          const res = await apiClient.get('/auth/me');
          if (res.data) {
            const userData = {
              id: res.data.id,
              uid: res.data.id,
              username: res.data.username,
              email: res.data.username,
              name: res.data.username?.split('@')[0],
              phone: res.data.phone,
              role_id: res.data.role_id,
              photo: res.data.profile_picture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop"
            };
            localStorage.setItem('app_user', JSON.stringify(userData));
            dispatch(login(userData));
          }
        } catch (err) {
          if (!storedUser) {
            dispatch(logout());
          }
        }
      };

      restoreSession();

      const unsubscribe = auth.onAuthStateChanged((authuser) => {
        if (authuser) {
          const fbUser = {
            id: authuser.uid,
            uid: authuser.uid,
            photo: authuser.photoURL,
            name: authuser.displayName,
            email: authuser.email,
            username: authuser.email,
            phoneNumber: authuser.phoneNumber,
          };
          localStorage.setItem('app_user', JSON.stringify(fbUser));
          dispatch(login(fbUser));
        }
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
