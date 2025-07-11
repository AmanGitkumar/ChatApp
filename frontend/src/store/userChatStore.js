import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./userAuthStore";


export const useChatStore = create((set,get) => ({

        messages: [],
        users: [],
        selectedUser: null,
        isUsersLoading: false,
        isMessagesLoading: false,

        getUsers: async () => {
            set({isUsersLoading:true});
            try{

                const res = await axiosInstance.get("/messages/users");
                set({users:res.data});

            } catch(error){
                toast.error(error.response.data.message);

            } finally{
                set({isUserLoading:false})
            }
        },

        getMessages: async(userId) => {

            set({isMessagesLoading:true});
            try{
                const res = await axiosInstance.get(`/messages/${userId}`);
                set({messages:res.data});
            }
            catch(error){
                toast.error(error.response.data.message);
            }finally{
                set({isMessagesLoading:false});
            }
        },

       sendMessage: async (messageData) => {
            const { selectedUser, messages } = get();
            try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
            set({ messages: [...messages, res.data] });
            
            } catch (error) {
            toast.error(error.response.data.message);
            }
        },


        subscribeToMessages: () => {
            const socket = useAuthStore.getState().socket;

            socket.off("newMessage"); // ✅ Clear previous listeners

            socket.on("newMessage", (newMessage) => {
                const { selectedUser, messages } = get();

                const isCurrentChat =
                newMessage.senderId === selectedUser?._id ||
                newMessage.receiverId === selectedUser?._id;

                if (isCurrentChat) {
                set({
                    messages: [...(messages || []), newMessage],
                });
                }
            });
            },


       unsubscribeFromMessages: () => {
            const socket = useAuthStore.getState().socket;
            if (socket) {
                socket.off("newMessage");
            }
        },

        setSelectedUser: (selectedUser) => set({selectedUser}),
        
}));
