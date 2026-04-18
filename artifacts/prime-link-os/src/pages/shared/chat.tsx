import { useState, useRef, useEffect } from "react";
import { useListMessages, useCreateMessage, useListUsers, getListMessagesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Send, Users, MessageCircle } from "lucide-react";

export default function ChatPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"group" | "private">("group");
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: users } = useListUsers();
  const { data: groupMessages } = useListMessages({ isGroup: true }, {
    query: { refetchInterval: 3000, queryKey: ["/api/messages", "group"] }
  });
  const { data: privateMessages } = useListMessages(
    selectedUser ? { receiverId: selectedUser } : {},
    { query: { enabled: !!selectedUser, refetchInterval: 3000, queryKey: ["/api/messages", "private", selectedUser] } }
  );

  const sendMessage = useCreateMessage();

  const otherUsers = (users ?? []).filter(u => u.id !== user?.id);
  const messages = activeTab === "group" ? (groupMessages ?? []) : (privateMessages ?? []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getUserName = (id: number) => {
    if (id === user?.id) return "You";
    return users?.find(u => u.id === id)?.name ?? `User #${id}`;
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user) return;
    sendMessage.mutate(
      {
        data: {
          content: message.trim(),
          isGroup: activeTab === "group",
          receiverId: activeTab === "private" ? selectedUser : null,
        }
      },
      {
        onSuccess: () => {
          setMessage("");
          queryClient.invalidateQueries({ queryKey: getListMessagesQueryKey({ isGroup: activeTab === "group" }) });
        },
      }
    );
  };

  return (
    <div className="space-y-0 h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-black text-white">Chat</h1>
        <p className="text-white/30 text-sm mt-1">Team communication hub</p>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        {/* Sidebar */}
        <div className="w-56 shrink-0 bg-white/[0.03] border border-white/5 rounded-2xl flex flex-col overflow-hidden">
          <div className="p-3 border-b border-white/5">
            <button
              onClick={() => setActiveTab("group")}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${activeTab === "group" ? "bg-blue-500/10 text-blue-400" : "text-white/40 hover:text-white"}`}
            >
              <Users className="h-4 w-4" /> Team Group
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <p className="text-xs text-white/20 uppercase tracking-widest px-2 py-2">Direct Messages</p>
            {otherUsers.map(u => (
              <button
                key={u.id}
                onClick={() => { setActiveTab("private"); setSelectedUser(u.id); }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors ${activeTab === "private" && selectedUser === u.id ? "bg-blue-500/10 text-blue-400" : "text-white/40 hover:text-white"}`}
              >
                <div className={`w-2 h-2 rounded-full shrink-0 ${u.online ? "bg-emerald-400" : "bg-white/10"}`} />
                <span className="truncate">{u.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 bg-white/[0.03] border border-white/5 rounded-2xl flex flex-col min-w-0">
          <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
            <MessageCircle className="h-4 w-4 text-blue-400" />
            <p className="font-semibold text-white text-sm">
              {activeTab === "group" ? "Team Group Chat" : `DM: ${users?.find(u => u.id === selectedUser)?.name ?? "Select a user"}`}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {messages.map(msg => {
              const isMine = msg.senderId === user?.id;
              return (
                <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-xs lg:max-w-md ${isMine ? "" : ""}`}>
                    {!isMine && <p className="text-xs text-white/30 mb-1 ml-1">{getUserName(msg.senderId)}</p>}
                    <div className={`px-4 py-2.5 rounded-2xl text-sm ${isMine ? "bg-blue-600 text-white rounded-tr-sm" : "bg-white/5 text-white/80 border border-white/5 rounded-tl-sm"}`}>
                      {msg.content}
                    </div>
                    <p className={`text-xs text-white/20 mt-1 ${isMine ? "text-right mr-1" : "ml-1"}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              );
            })}
            {messages.length === 0 && (
              <div className="flex-1 flex items-center justify-center text-white/20 text-sm h-full">
                {activeTab === "private" && !selectedUser ? "Select a user to start chatting" : "No messages yet. Say hello!"}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-4 border-t border-white/5">
            <form onSubmit={handleSend} className="flex gap-3">
              <input
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder={activeTab === "private" && !selectedUser ? "Select a user first..." : "Type a message..."}
                disabled={activeTab === "private" && !selectedUser}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500/50 placeholder:text-white/20 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!message.trim() || sendMessage.isPending || (activeTab === "private" && !selectedUser)}
                className="p-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
