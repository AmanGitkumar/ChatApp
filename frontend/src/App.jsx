import { Routes , Route, Navigate} from "react-router-dom";
import Navbar from "./components/Navbar"; // ✅ Default import

import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import { useAuthStore } from "./store/userAuthStore";
import { useThemeStore } from "./store/userThemeStore";
import { useEffect } from "react";
import {Loader} from "lucide-react"
import { Toaster } from "react-hot-toast";

const App = () => {

  const {authUser,checkAuth,isCheckingAuth,onlineUsers} = useAuthStore();

  console.log({onlineUsers});

  const {theme} = useThemeStore()

  useEffect(() => {

    checkAuth();

  }, [checkAuth]);

  console.log({authUser});

  // THEME

   useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  if(isCheckingAuth && !authUser) return (

    <div className="flex items-center justify-center h-screen">
      <Loader className="size-10 animate-spin" />
    </div>
  )

  return (

   <div >
   
    <Navbar/>

    <div className="pt-16"></div>

     <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/" />} />
      </Routes>


    <Toaster />
    
   </div>
   
  )
}

export default App;