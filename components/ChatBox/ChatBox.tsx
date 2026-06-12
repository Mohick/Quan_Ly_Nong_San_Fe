"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, User, Image as ImageIcon } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { toast } from "react-toastify";

function getCookieLocal(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return undefined;
}

interface ChatMessage {
  SenderID: string;
  ReceiverID: string;
  Content: string;
  ImageURL?: string;
  CreatedAt: string;
}

export default function ChatBox({ farmId, farmName }: { farmId: string; farmName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  useEffect(() => {
    const handleOpenChatEvent = () => {
      if (!isOpen) {
        fetchHistory();
        connectWebSocket();
        setIsOpen(true);
      }
    };
    window.addEventListener("open-chat", handleOpenChatEvent);
    return () => window.removeEventListener("open-chat", handleOpenChatEvent);
  }, [isOpen, userId, farmId]);

  useEffect(() => {
    // Attempt to get user info from localStorage
    const localUser = localStorage.getItem("user");
    if (localUser) {
      try {
        const parsed = JSON.parse(localUser);
        setUserId(parsed.id || parsed.ID || "user-123"); // fallback if format differs
      } catch (e) {
        setUserId("user-123");
      }
    } else {
      setUserId("guest-" + Math.floor(Math.random() * 1000));
    }
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await axiosInstance.get(`/chat/history/${farmId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.data) {
        setMessages(res.data.data);
      }
    } catch (error) {
      console.warn("Could not load chat history", error);
    }
  };

  const connectWebSocket = () => {
    // Dynamically get baseUrl, fallback to localhost:8080/api/v1
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8080/api/v1";
    const wsBase = baseUrl.replace(/^http/, "ws");
    
    // Ensure we have a valid userId, even if state is delayed
    let currentUserId = userId;
    if (!currentUserId) {
      const localUser = localStorage.getItem("user");
      if (localUser) {
        try {
          const parsed = JSON.parse(localUser);
          currentUserId = parsed.id || parsed.ID || "user-123";
        } catch (e) {}
      }
      if (!currentUserId) currentUserId = "guest-" + Math.floor(Math.random() * 1000);
      setUserId(currentUserId);
    }

    if (ws.current) return; // already connected

    const wsUrl = `${wsBase}/chat/ws?user_id=${currentUserId}`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log("Chat WS Connected");
    };

    socket.onmessage = (event) => {
      try {
        const newMsg = JSON.parse(event.data);
        setMessages((prev) => [...prev, newMsg]);
      } catch (e) {
        console.error("Error parsing WS message", e);
      }
    };

    socket.onclose = () => {
      console.log("Chat WS Disconnected");
      ws.current = null;
    };

    socket.onerror = (error) => {
      console.error("Chat WS Error", error);
    };

    ws.current = socket;
  };

  const handleOpenChat = () => {
    if (!isOpen) {
      fetchHistory();
      connectWebSocket();
    }
    setIsOpen(!isOpen);
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !ws.current || ws.current.readyState !== WebSocket.OPEN) {
        if (ws.current?.readyState !== WebSocket.OPEN) {
            toast.error("Chưa kết nối được hệ thống Chat!");
        }
        return;
    }

    const payload = {
      receiver_id: farmId,
      farm_id: farmId,
      content: input.trim(),
    };

    ws.current.send(JSON.stringify(payload));
    
    setMessages((prev) => [
      ...prev,
      {
        SenderID: userId || "",
        ReceiverID: farmId,
        Content: input.trim(),
        CreatedAt: new Date().toISOString()
      }
    ]);
    
    setInput("");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !ws.current || ws.current.readyState !== WebSocket.OPEN) return;

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
          receiver_id: farmId,
          farm_id: farmId,
          content: "Đã gửi một ảnh",
          image_url: imageUrl,
        };
        ws.current.send(JSON.stringify(payload));
        
        setMessages((prev) => [
          ...prev,
          {
            SenderID: userId || "",
            ReceiverID: farmId,
            Content: "Đã gửi một ảnh",
            ImageURL: imageUrl,
            CreatedAt: new Date().toISOString()
          }
        ]);
      }
    } catch (err) {
      toast.error("Không thể tải ảnh lên!");
    }
    // reset file input
    e.target.value = '';
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={handleOpenChat}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#13a855] text-white shadow-xl transition-transform hover:scale-110 active:scale-95"
        >
          <MessageSquare className="h-6 w-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[450px] w-80 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl sm:w-96">
          {/* Header */}
          <div className="flex items-center justify-between bg-[#13a855] p-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <User className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold leading-none">{farmName}</h3>
                <span className="text-[10px] font-medium text-green-100">Đang hoạt động</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 transition-colors hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-200">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-gray-400">
                <MessageSquare className="mb-2 h-8 w-8 opacity-20" />
                <p className="text-xs">Hãy gửi lời chào đến {farmName}!</p>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isMe = msg.SenderID === userId;
                return (
                  <div key={idx} className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                        isMe
                          ? "rounded-br-sm bg-[#13a855] text-white"
                          : "rounded-bl-sm border border-gray-100 bg-white text-gray-800"
                      }`}
                    >
                      {msg.ImageURL ? (
                        <div>
                          <img src={msg.ImageURL} alt="attachment" className="rounded-lg mb-1 max-w-full h-auto object-contain max-h-40" />
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

          {/* Input Area */}
          <form onSubmit={sendMessage} className="flex items-center gap-2 border-t border-gray-100 bg-white p-3">
            <label className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition-colors">
              <ImageIcon className="h-5 w-5" />
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập tin nhắn..."
              className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm focus:border-[#13a855] focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#13a855] text-white transition-colors disabled:bg-gray-300"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
