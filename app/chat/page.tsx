"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { getUserConversationsAPI, getChatHistoryAPI } from "@/lib/_api/chat";
import { getAllFarmAPI } from "@/lib/_api/get_all_farm";
import { MessageSquare, Send, User, Search, Store, Image as ImageIcon } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { toast } from "react-toastify";
import { useSearchParams } from "next/navigation";

function getCookieLocal(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return undefined;
}

interface Conversation {
  id: string; // This is the farm_id
  name: string; // name of the farm
  avatar: string; // avatar url
}

interface ChatMessage {
  SenderID: string;
  ReceiverID: string;
  Content: string;
  ImageURL?: string;
  CreatedAt: string;
}

function UserChatContent() {
  const searchParams = useSearchParams();
  const storeId = searchParams.get("store_id");
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChat, setActiveChat] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  
  const ws = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeChat]);

  // Load User ID
  useEffect(() => {
    const localUser = localStorage.getItem("user");
    if (localUser) {
      try {
        const parsed = JSON.parse(localUser);
        setUserId(parsed.id || parsed.ID || "user-123");
      } catch (e) {}
    } else {
      setUserId("guest-" + Math.floor(Math.random() * 1000));
    }
  }, []);

  // Fetch Conversations and resolve store_id
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const token = getCookieLocal("access_token") || localStorage.getItem("access_token") || localStorage.getItem("token");
        if (!token) {
           setIsInitializing(false);
           return;
        }
        const res = await getUserConversationsAPI(token);
        
        let mapped: Conversation[] = [];
        if (res.data && Array.isArray(res.data)) {
          mapped = res.data.map((farm: any) => ({
            id: farm.id || farm.ID,
            name: farm.name || farm.Name || farm.farm_name || farm.FarmName || "Nhà vườn",
            avatar: farm.avatar || farm.Avatar || farm.image_url || farm.ImageURL || "",
          }));
        }

        // Check if there is a store_id in the URL
        if (storeId) {
          const found = mapped.find(c => c.id === storeId);
          if (found) {
            setActiveChat(found);
          } else {
            // Not in conversation history yet, fetch farm details to pre-populate
            try {
              const farmRes = await getAllFarmAPI();
              const farmData = Array.isArray(farmRes.data?.data) ? farmRes.data.data : (Array.isArray(farmRes.data) ? farmRes.data : []);
              const foundFarm = farmData.find((f: any) => (f.id || f.ID) === storeId);
              
              if (foundFarm) {
                const newFarm: Conversation = {
                  id: foundFarm.id || foundFarm.ID || storeId,
                  name: foundFarm.farm_name || foundFarm.FarmName || "Nhà vườn mới",
                  avatar: foundFarm.image_url || foundFarm.ImageURL || "",
                };
                mapped = [newFarm, ...mapped];
                setActiveChat(newFarm);
              } else {
                setActiveChat({ id: storeId, name: "Nhà vườn", avatar: "" });
              }
            } catch (e) {
              console.error("Could not fetch new farm details for chat:", e);
              setActiveChat({ id: storeId, name: "Nhà vườn", avatar: "" });
            }
          }
        }
        
        setConversations(mapped);
      } catch (err) {
        console.error("Error fetching conversations:", err);
      } finally {
        setIsInitializing(false);
      }
    };
    fetchConversations();
  }, [storeId]);

  // Load chat history when active chat changes
  useEffect(() => {
    if (!activeChat) return;

    const fetchHistory = async () => {
      try {
        const token = getCookieLocal("access_token") || localStorage.getItem("token");
        if (!token) return;
        const res = await getChatHistoryAPI(activeChat.id, token);
        if (res.data) setMessages(res.data);
      } catch (err) {
        console.error("Could not load chat history", err);
      }
    };
    fetchHistory();
  }, [activeChat]);

  // Handle WebSocket connection for active chat
  useEffect(() => {
    if (!userId || !activeChat) return;

    if (ws.current) {
        ws.current.close();
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080/api/v1";
    const wsBase = baseUrl.replace(/^http/, "ws");
    const wsUrl = `${wsBase}/chat/ws?user_id=${userId}`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => console.log("User Chat WS Connected");
    socket.onmessage = (event) => {
      try {
        const newMsg = JSON.parse(event.data);
        // Only append if it belongs to the current conversation
        if (newMsg.SenderID === activeChat.id || newMsg.ReceiverID === activeChat.id) {
            setMessages((prev) => [...prev, newMsg]);
        }
      } catch (e) {
        console.error("Error parsing WS message", e);
      }
    };
    socket.onclose = () => console.log("User Chat WS Disconnected");
    
    ws.current = socket;

    return () => {
        socket.close();
    };
  }, [userId, activeChat]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeChat) return;
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
        toast.error("Mất kết nối! Đang kết nối lại...");
        return;
    }

    const payload = {
      receiver_id: activeChat.id,
      farm_id: activeChat.id,
      content: input.trim(),
    };

    ws.current.send(JSON.stringify(payload));
    
    setMessages((prev) => [
      ...prev,
      {
        SenderID: userId || "",
        ReceiverID: activeChat.id,
        Content: input.trim(),
        CreatedAt: new Date().toISOString()
      }
    ]);
    setInput("");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !ws.current || ws.current.readyState !== WebSocket.OPEN || !activeChat) return;

    try {
      const formData = new FormData();
      formData.append("image", file);
      
      const token = getCookieLocal("access_token") || localStorage.getItem("token");
      const res = await axiosInstance.post("/chat/upload-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        }
      });
      
      if (res.data && res.data.data && res.data.data.image_url) {
        const imageUrl = res.data.data.image_url;
        const payload = {
          receiver_id: activeChat.id,
          farm_id: activeChat.id,
          content: "Đã gửi một ảnh",
          image_url: imageUrl,
        };
        ws.current.send(JSON.stringify(payload));
        
        setMessages((prev) => [
          ...prev,
          {
            SenderID: userId || "",
            ReceiverID: activeChat.id,
            Content: "Đã gửi một ảnh",
            ImageURL: imageUrl,
            CreatedAt: new Date().toISOString()
          }
        ]);
      }
    } catch (err) {
      toast.error("Không thể tải ảnh lên!");
    }
    e.target.value = '';
  };

  if (isInitializing) {
    return (
      <div className="flex h-[calc(100vh-80px)] bg-[#f8faf9] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#13a855] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-80px)] bg-[#f8faf9]">
      {/* Left Sidebar - Conversations */}
      <div className="w-full max-w-sm border-r border-gray-200 bg-white flex flex-col h-full">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-xl font-black text-gray-900 mb-4">Tin nhắn</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm cửa hàng..." 
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-[#13a855] transition-colors"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <Store className="h-10 w-10 mx-auto mb-2 opacity-20" />
              <p className="text-sm font-medium">Bạn chưa có tin nhắn nào</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setActiveChat(conv)}
                  className={`flex items-center gap-3 p-4 transition-colors hover:bg-gray-50 text-left border-b border-gray-50 ${activeChat?.id === conv.id ? 'bg-emerald-50 hover:bg-emerald-50' : ''}`}
                >
                  <div className="relative h-12 w-12 rounded-full overflow-hidden border border-gray-200 bg-gray-100 shrink-0">
                    {conv.avatar ? (
                      <img src={conv.avatar} alt={conv.name} className="h-full w-full object-cover" />
                    ) : (
                      <Store className="h-6 w-6 text-gray-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h3 className="font-bold text-gray-900 truncate">{conv.name}</h3>
                    <p className="text-xs text-gray-500 truncate mt-0.5">Bấm để xem tin nhắn</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Content - Chat Window */}
      <div className="flex-1 flex flex-col bg-white h-full relative">
        {activeChat ? (
          <>
            {/* Header */}
            <div className="h-16 border-b border-gray-200 flex items-center px-6 gap-4 shrink-0 bg-white">
              <div className="h-10 w-10 rounded-full overflow-hidden border border-gray-200 bg-gray-100">
                {activeChat.avatar ? (
                  <img src={activeChat.avatar} alt={activeChat.name} className="h-full w-full object-cover" />
                ) : (
                  <Store className="h-5 w-5 text-gray-400 mx-auto mt-2.5" />
                )}
              </div>
              <div>
                <h3 className="font-black text-gray-900">{activeChat.name}</h3>
                <span className="text-[10px] font-bold text-[#13a855] flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#13a855]"></span> Đang hoạt động
                </span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <MessageSquare className="h-12 w-12 mb-3 opacity-20" />
                  <p className="font-medium text-sm">Gửi tin nhắn đầu tiên đến cửa hàng</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMe = msg.SenderID === userId;
                  return (
                    <div key={idx} className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[60%] rounded-2xl px-5 py-2.5 text-sm shadow-sm ${
                          isMe
                            ? "rounded-br-sm bg-[#13a855] text-white"
                            : "rounded-bl-sm border border-gray-100 bg-white text-gray-800"
                        }`}
                      >
                        {msg.ImageURL ? (
                          <div>
                            <img src={msg.ImageURL} alt="attachment" className="rounded-lg mb-1 max-w-full h-auto object-contain max-h-48" />
                            <span className="text-xs opacity-80">{msg.Content}</span>
                          </div>
                        ) : (
                          msg.Content
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-100 shrink-0">
              <form onSubmit={sendMessage} className="flex items-center gap-3">
                <label className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200">
                  <ImageIcon className="h-5 w-5" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-5 py-3 text-sm focus:outline-none focus:border-[#13a855]"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="h-11 w-11 flex items-center justify-center rounded-xl bg-[#13a855] text-white transition-all disabled:bg-gray-300 hover:bg-[#0f8b44] active:scale-95"
                >
                  <Send className="h-5 w-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <MessageSquare className="h-16 w-16 mb-4 opacity-20" />
            <h3 className="text-lg font-black text-gray-900 mb-1">Tin nhắn của bạn</h3>
            <p className="text-sm font-medium">Chọn một hội thoại ở cột trái để bắt đầu nhắn tin</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function UserChatPage() {
  return (
    <Suspense fallback={<div className="flex h-[calc(100vh-80px)] bg-[#f8faf9] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[#13a855] border-t-transparent"></div></div>}>
      <UserChatContent />
    </Suspense>
  );
}
