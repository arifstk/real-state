// app/admin/views/AdminContactView.tsx

"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Mail, RefreshCw, CheckCircle, Clock } from "lucide-react";

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  message: string;
  status: "unread" | "read";
  createdAt: string;
}

export default function AdminContactView() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactMessage | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/contacts");
        const data = await res.json();
        if (isMounted) {
          if (data.success) {
            setMessages(data.contacts);
          } else {
            toast.error("Failed to load messages");
          }
        }
      } catch {
        if (isMounted) toast.error("Error fetching messages");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMessages();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpen = async (msg: ContactMessage) => {
    setSelected(msg);
    if (msg.status === "read") return;

    setMessages((prev) =>
      prev.map((m) => (m._id === msg._id ? { ...m, status: "read" } : m))
    );

    try {
      await fetch(`/api/admin/contacts/${msg._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "read" }),
      });
    } catch {
      toast.error("Failed to update message status");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-3">
        <RefreshCw size={24} className="animate-spin text-teal-600" />
        <p className="text-xs text-slate-400 font-medium">Loading contact messages...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Contact Messages</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage inquiries and messages submitted by visitors.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {messages.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">No messages found.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {messages.map((msg) => (
              <div
                key={msg._id}
                onClick={() => handleOpen(msg)}
                className={`p-4 flex items-center justify-between cursor-pointer transition-all hover:bg-slate-50 ${msg.status === "unread" ? "bg-teal-50/30 font-semibold" : ""
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${msg.status === "unread" ? "bg-teal-100 text-teal-700" : "bg-slate-100 text-slate-500"}`}>
                    <Mail size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs text-slate-800 font-bold">{msg.name}</h4>
                    <p className="text-[11px] text-slate-400">{msg.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock size={11} /> {new Date(msg.createdAt).toLocaleDateString()}
                  </span>
                  {msg.status === "unread" ? (
                    <span className="w-2 h-2 rounded-full bg-teal-600"></span>
                  ) : (
                    <CheckCircle size={14} className="text-slate-300" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800">Message from {selected.name}</h3>
            <button onClick={() => setSelected(null)} className="text-xs text-slate-400 hover:text-slate-600">Close</button>
          </div>
          <p className="text-xs text-slate-600 bg-slate-50 p-4 rounded-xl leading-relaxed">{selected.message}</p>
        </div>
      )}
    </div>
  );
}

