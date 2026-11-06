"use client";

import React, { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { MessageSquare, Send, Circle } from "lucide-react";
import { io, Socket } from "socket.io-client";
import { useToast } from "@/components/ui/toast";

export default function ProviderMessagesPage() {
  const toast = useToast();
  const [user, setUser] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversation, setActiveConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessageText, setNewMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((userData) => {
        if (userData.success) {
          setUser(userData.user);

          const socketUrl =
            process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || "http://localhost:4001";
          const socket = io(socketUrl, {
            transports: ["websocket", "polling"],
            timeout: 5000,
            reconnectionAttempts: 3,
          });

          socket.on("connect", () => {
            setIsSocketConnected(true);
            socket.emit("identify", { userId: userData.user.id });
          });

          socket.on("disconnect", () => {
            setIsSocketConnected(false);
          });

          socket.on("message:received", (msg: any) => {
            setMessages((prev) => [...prev, msg]);
          });

          socketRef.current = socket;
        }
      })
      .catch(() => {});

    fetch("/api/conversations")
      .then((r) => r.json())
      .then((convData) => {
        if (convData.success) {
          setConversations(convData.conversations);
          if (convData.conversations.length > 0) {
            setActiveConversation(convData.conversations[0]);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (!activeConversation) return;

    fetch(`/api/conversations/${activeConversation._id}/messages`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setMessages(data.messages);
        }
      })
      .catch(() => {});

    if (socketRef.current) {
      socketRef.current.emit("conversation:join", {
        conversationId: activeConversation._id,
      });
    }
  }, [activeConversation]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !activeConversation) return;

    const messageText = newMessageText.trim();
    setNewMessageText("");
    setIsSending(true);

    try {
      const res = await fetch(
        `/api/conversations/${activeConversation._id}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: messageText }),
        }
      );

      const data = await res.json();
      setIsSending(false);

      if (data.success && data.message) {
        setMessages((prev) => [...prev, data.message]);

        if (socketRef.current && socketRef.current.connected) {
          const otherParticipant = activeConversation.participants.find(
            (p: any) => p._id !== user.id
          );
          socketRef.current.emit("message:send", {
            conversationId: activeConversation._id,
            recipientId: otherParticipant?._id,
            message: data.message,
          });
        }
      }
    } catch (err) {
      setIsSending(false);
      toast.error("Failed to send message");
    }
  };

  const getOtherParticipant = (conv: any) => {
    if (!conv?.participants || !user) return null;
    return conv.participants.find((p: any) => p._id !== user.id) || conv.participants[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner message="Opening chat center..." />
      </div>
    );
  }

  return (
    <DashboardLayout
      user={user || { id: "", name: "Provider", email: "", role: "provider" }}
      title="Client Inquiries & Live Messages"
      subtitle="Direct communication with customer leads and active appointments"
    >
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden h-[700px] flex flex-col md:flex-row">
        {/* Conversations Sidebar */}
        <div className="w-full md:w-80 border-r border-slate-200 flex flex-col bg-slate-50/50">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Conversations</h3>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <Circle
                className={`h-2.5 w-2.5 fill-current ${
                  isSocketConnected ? "text-emerald-500" : "text-amber-500"
                }`}
              />
              <span>{isSocketConnected ? "Live" : "REST Sync"}</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No customer conversations yet. When clients book or message you, they appear here.
              </div>
            ) : (
              conversations.map((conv) => {
                const other = getOtherParticipant(conv);
                const isSelected = activeConversation?._id === conv._id;

                return (
                  <button
                    key={conv._id}
                    onClick={() => setActiveConversation(conv)}
                    className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors ${
                      isSelected
                        ? "bg-white border-l-4 border-brand-600 shadow-2xs"
                        : "hover:bg-slate-100/70"
                    }`}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold text-xs shrink-0">
                      {other?.name?.charAt(0) || "C"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {other?.name}
                        </p>
                        <span className="text-[10px] text-slate-400">
                          {new Date(conv.lastMessageAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {conv.lastMessage || "No messages yet"}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Thread Panel */}
        <div className="flex-1 flex flex-col bg-white">
          {activeConversation ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-800 font-bold text-xs">
                    {getOtherParticipant(activeConversation)?.name?.charAt(0) || "C"}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      {getOtherParticipant(activeConversation)?.name}
                    </h4>
                    <p className="text-[10px] text-slate-500">Customer Client</p>
                  </div>
                </div>
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/40">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-xs text-slate-400">
                    <MessageSquare className="h-8 w-8 text-slate-300 mb-2" />
                    <span>Send a message to greet this client.</span>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = m.sender?._id === user?.id || m.sender === user?.id;

                    return (
                      <div
                        key={m._id}
                        className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`max-w-sm rounded-2xl px-4 py-2.5 text-xs shadow-2xs leading-relaxed ${
                            isMe
                              ? "bg-brand-600 text-white rounded-br-none"
                              : "bg-white text-slate-800 border border-slate-200 rounded-bl-none"
                          }`}
                        >
                          <p>{m.message}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 px-1">
                          {new Date(m.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Footer */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 border-t border-slate-200 flex items-center gap-2 bg-white"
              >
                <input
                  type="text"
                  placeholder="Type a message to customer..."
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-brand-500 focus:outline-none"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={!newMessageText.trim() || isSending}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <MessageSquare className="h-12 w-12 text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-700">No Chat Selected</p>
              <p className="text-xs text-slate-400 mt-1">
                Select an active customer inquiry from the left to respond.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

