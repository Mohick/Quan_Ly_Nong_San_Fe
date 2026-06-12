"use client";

import React, { useState, useEffect, useRef } from "react";
import { getFarmConversationsAPI, getChatHistoryAPI } from "@/lib/_api/chat";
import { FarmAPI } from "@/lib/_api/farm";
import { MessageSquare, Send, User, Search, Image as ImageIcon } from "lucide-react";
import { toast } from "react-toastify";
import axiosInstance from "@/lib/axios";

function getCookieLocal(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return undefined;
}

interface Conversation {
  id: string; // This is the user_id
  name: string; // name of the user
  avatar: string; // avatar url
}

interface ChatMessage {
  SenderID: string;
  ReceiverID: string;
  Content: string;
  ImageURL?: string;
  CreatedAt: string;
}

export default function FarmChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChat, setActiveChat] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [farmId, setFarmId] = useState<string | null>(null);
  
  const ws = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeChat]);

  // Fetch Farm ID & Conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const token = getCookieLocal("access_token") || localStorage.getItem("token");
        if (!token) return;

        // Get Farm ID
        const farmRes = await FarmAPI(token);
        const currentFarmId = farmRes?.data?.id || farmRes?.data?.ID;
        
        if (currentFarmId) {
            setFarmId(currentFarmId);
            const res = await getFarmConversationsAPI(currentFarmId, token);
            // Map user list to conversation format
            if (res.data && Array.isArray(res.data)) {
                const mapped = res.data.map((u: any) => ({
                    id: u.id || u.ID,
                    name: u.full_name || u.FullName || u.name || "Khách hàng",
                    avatar: u.avatar_url || u.AvatarUrl || u.avatar || "",
                }));
                setConversations(mapped);
            }
        }
      } catch (err) {
        console.error("Error fetching conversations:", err);
      }
    };
    fetchConversations();
  }, []);

  // Load chat history when active chat changes
  useEffect(() => {
    if (!activeChat) return;

    const fetchHistory = async () => {
      try {
        const token = getCookieLocal("access_token") || localStorage.getItem("token");
        if (!token) return;
        // The backend history API: `/api/v1/chat/history/{user_id}` or `{farm_id}`
        // It fetches messages between current user (from token) and the target user
        const res = await getChatHistoryAPI(activeChat.id, token);
        if (res.data) setMessages(res.data);
      } catch (err) {
        console.error("Could not load chat history", err);
      }
    };
    fetchHistory();
  }, [activeChat]);

  // Handle WebSocket connection
  useEffect(() => {
    if (!farmId || !activeChat) return;

    if (ws.current) {
        ws.current.close();
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080/api/v1";
    const wsBase = baseUrl.replace(/^http/, "ws");
    const wsUrl = `${wsBase}/chat/ws?user_id=${farmId}`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => console.log("Farm Chat WS Connected");
    socket.onmessage = (event) => {
      try {
        const newMsg = JSON.parse(event.data);
        if (newMsg.SenderID === activeChat.id || newMsg.ReceiverID === activeChat.id) {
            setMessages((prev) => [...prev, newMsg]);
        }
      } catch (e) {
        console.error("Error parsing WS message", e);
      }
    };
    socket.onclose = () => console.log("Farm Chat WS Disconnected");
    
    ws.current = socket;

    return () => {
        socket.close();
    };
  }, [farmId, activeChat]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeChat) return;
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
        toast.error("Mất kết nối! Đang kết nối lại...");
        return;
    }

    const payload = {
      receiver_id: activeChat.id,
      farm_id: farmId, // Depending on backend, we send our own ID or the target ID
      content: input.trim(),
    };

    ws.current.send(JSON.stringify(payload));
    
    setMessages((prev) => [
      ...prev,
      {
        SenderID: farmId || "",
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
          farm_id: farmId,
          content: "Đã gửi một ảnh",
          image_url: imageUrl,
        };
        ws.current.send(JSON.stringify(payload));
        
        setMessages((prev) => [
          ...prev,
          {
            SenderID: farmId || "",
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

  return (
    <div className="flex h-[calc(100vh-120px)] bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Left Sidebar - Conversations */}
      <div className="w-full max-w-[320px] border-r border-gray-200 bg-white flex flex-col h-full">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-black text-gray-900 mb-3">Tin nhắn Khách hàng</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Tìm kiếm khách hàng..." 
              className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-9 pr-3 text-xs focus:outline-none focus:border-[#13a855] transition-colors"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <User className="h-10 w-10 mx-auto mb-2 opacity-20" />
              <p className="text-xs font-medium">Chưa có tin nhắn nào</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setActiveChat(conv)}
                  className={`flex items-center gap-3 p-3 transition-colors hover:bg-gray-50 text-left border-b border-gray-50 ${activeChat?.id === conv.id ? 'bg-emerald-50 hover:bg-emerald-50' : ''}`}
                >
                  <div className="relative h-10 w-10 rounded-full overflow-hidden border border-gray-200 bg-gray-100 shrink-0">
                    {conv.avatar ? (
                      <img src={conv.avatar} alt={conv.name} className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-5 w-5 text-gray-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h3 className="font-bold text-gray-900 text-sm truncate">{conv.name}</h3>
                    <p className="text-[11px] text-gray-500 truncate mt-0.5">Bấm để trả lời khách...</p>
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
            <div className="h-14 border-b border-gray-200 flex items-center px-5 gap-3 shrink-0 bg-white">
              <div className="h-8 w-8 rounded-full overflow-hidden border border-gray-200 bg-gray-100">
                {activeChat.avatar ? (
                  <img src={activeChat.avatar} alt={activeChat.name} className="h-full w-full object-cover" />
                ) : (
                  <User className="h-4 w-4 text-gray-400 mx-auto mt-2" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">{activeChat.name}</h3>
                <span className="text-[10px] font-bold text-[#13a855] flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#13a855]"></span> Đang hoạt động
                </span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <MessageSquare className="h-10 w-10 mb-2 opacity-20" />
                  <p className="font-medium text-xs">Phản hồi khách hàng ngay!</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMe = msg.SenderID === farmId;
                  return (
                    <div key={idx} className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[65%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
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
            <div className="p-3 bg-white border-t border-gray-100 shrink-0">
              <form onSubmit={sendMessage} className="flex items-center gap-2">
                <label className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200">
                  <ImageIcon className="h-4 w-4" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Nhập tin nhắn trả lời..."
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#13a855]"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="h-10 w-10 flex items-center justify-center rounded-lg bg-[#13a855] text-white transition-all disabled:bg-gray-300 hover:bg-[#0f8b44] active:scale-95"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <MessageSquare className="h-16 w-16 mb-4 opacity-20" />
            <h3 className="text-base font-black text-gray-900 mb-1">Hỗ trợ khách hàng</h3>
            <p className="text-xs font-medium">Chọn một khách hàng bên trái để tư vấn nông sản</p>
          </div>
        )}
      </div>
    </div>
  );
}
