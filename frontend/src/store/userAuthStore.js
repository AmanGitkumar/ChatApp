import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL =  import.meta.env.MODE === "development" ?"http://localhost:5001" : "/";

export const useAuthStore = create((set,get) => ({
    authUser: null,

    isSigningUp:false,    
    isLoggingIng:false,
    isUpdatingProfile:false,
    isCheckingAuth:true,
    onlineUsers: [],
    socket:null,

    checkAuth: async () => {
        try{

            const res = await axiosInstance.get("/auth/check");
            
            set({authUser:res.data}); 
            get().connectSocket();


        }catch(error){
            console.log("error in userAuthstore",error.message);
            set({authUser:null});
            
        } finally{
            set({ isCheckingAuth:false });
        }
    },

    signup: async (data) => {

        set({isSigningUp:true});

        try{

            const res = await axiosInstance.post("/auth/signup",data);
            set({authUser: res.data});
            toast.success("Account created successfully");
            get().connectSocket();


        }catch(error){
            toast.error(error?.response?.data?.message || "Signup failed");

        } finally{
            set({isSigningUp:false});

        }

    },

    login: async (data) => {
        
        set({isLoggingIng:true});

        try{

            const res = await axiosInstance.post("/auth/login",data);
            set({authUser:res.data});
            toast.success("Logged in successfully");
            get().connectSocket();
        }
        catch(error){
            toast.error(error.response.data.message);
        } finally{
            set({isLoggingIng:false});
        }

  },

    logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
       
      toast.error(error.response.data.message);
    }
  },

 updateProfile: async (data) => {
  set({ isUpdatingProfile: true });
  try {
    const token = localStorage.getItem("token"); // get your token
    const res = await axiosInstance.put("/auth/update-profile", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    set({ authUser: res.data });
    toast.success("Profile updated successfully");
  } catch (error) {
    console.log("error in update profile pic", error);
    toast.error(
      error.response?.data?.message || "Server error while updating profile"
    );
  } finally {
    set({ isUpdatingProfile: false });
  }
},

  connectSocket: () => {
  const { authUser, socket } = get();
  if (!authUser || socket?.connected) return;

  const newSocket = io(BASE_URL, {
    query: {
      userId: authUser._id,
    },
  });

  newSocket.connect();

  // 🧠 Register event BEFORE setting socket to state
  newSocket.on("getOnlineUsers", (userIds) => {
    set({ onlineUsers: userIds });
  });

  set({ socket: newSocket });

  console.log("Socket connected");
},


 disconnectSocket: () => {
  const { socket } = get();
  if (socket && socket.connected) {
    socket.disconnect(); // ✅ correct method
    set({ socket: null }); // 🧼 cleanup
    console.log("Socket disconnected");
  }
},


  
}));