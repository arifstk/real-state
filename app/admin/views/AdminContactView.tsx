// views/AdminContactView.tsx

"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Search, RefreshCw, Mail, Trash2, CheckCircle2,
  Copy, Inbox, Clock, ExternalLink
} from "lucide-react";

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "unread" | "read" | "replied";
  createdAt: string;
}

const subjectColors: Record<string, string> = {
  "General Inquiry": "bg-slate-50 text-slate-700 border-slate-200",
  "Booking Issue": "bg-rose-50 text-rose-700 border-rose-200",
  "Payment & Refund": "bg-amber-50 text-amber-700 border-amber-200",
  "Hotel Partnership": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Technical Support": "bg-violet-50 text-violet-700 border-violet-200",
  "Feedback": "bg-sky-50 text-sky-700 border-sky-200",
  "Other": "bg-slate-50 text-slate-700 border-slate-200",
};

export default function AdminContactView() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ── Fetch Messages ──
  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/contacts");
      const data = await res.json();
      if (data.success) {
        setMessages(data.contacts);
      } else {
        toast.error("Failed to load messages");
      }
    } catch {
      toast.error("Error fetching messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);


  const handleOpen = async (msg: ContactMessage) => {
    setSelected(msg);
    if (msg.status === "read") return;

    // Optimistic UI update (removes green dot & updates count immediately)
    setMessages((prev) =>
      prev.map((m) => (m._id === msg._id ? { ...m, status: "read" } : m))
    );

    try {
      const res = await fetch(`/api/admin/contacts`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: msg._id, status: "read" }),
      });

      const data = await res.json();
      if (!data.success) {
        // Revert status back if API call fails
        setMessages((prev) =>
          prev.map((m) => (m._id === msg._id ? { ...m, status: "unread" } : m))
        );
        toast.error("Failed to update read status");
      }
    } catch {
      // Revert status back on error
      setMessages((prev) =>
        prev.map((m) => (m._id === msg._id ? { ...m, status: "unread" } : m))
      );
    }
  };

  // ── Delete Message ──
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/contacts?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Message deleted successfully");
        setMessages((prev) => prev.filter((m) => m._id !== id));
        if (selected?._id === id) setSelected(null);
      } else {
        toast.error(data.error || "Delete failed");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setDeletingId(null);
    }
  };

  // ── Mailto builder ──
  const buildMailto = (msg: ContactMessage) => {
    const subject = encodeURIComponent(`Re: ${msg.subject} — LuxuryStays Support Team`);
    const body = encodeURIComponent(
      `Hi ${msg.name},\n\nThank you for reaching out to LuxuryStays Support!\n\n` +
      `Regarding your message:\n"${msg.message}"\n\n` +
      `[Type your reply here]\n\n` +
      `Best regards,\nLuxuryStays Support Team`
    );
    return `mailto:${msg.email}?subject=${subject}&body=${body}`;
  };

  // ── Filter & Search Logic ──
  const filtered = messages.filter((m) => {
    const matchFilter =
      filter === "all" ? true : filter === "unread" ? m.status === "unread" : m.status !== "unread";
    const matchSearch =
      !search ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.subject.toLowerCase().includes(search.toLowerCase()) ||
      m.message.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const unreadCount = messages.filter((m) => m.status === "unread").length;

  return (
    <div className="max-w-7xl space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Support Messages</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {loading ? "Loading messages..." : `${messages.length} total messages · `}
            {!loading && unreadCount > 0 && (
              <span className="text-teal-600 font-semibold">{unreadCount} unread</span>
            )}
          </p>
        </div>
        <button
          onClick={fetchMessages}
          className="flex items-center gap-1.5 text-xs text-slate-700 hover:bg-slate-100 bg-white px-3.5 py-2 rounded-xl border border-slate-200 transition-all font-semibold shadow-xs cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Filter tabs & Search */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1 border border-slate-200/60">
          {(["all", "unread", "read"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize cursor-pointer ${filter === f
                ? "bg-teal-600 text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800"
                }`}
            >
              {f} {f === "unread" && unreadCount > 0 && `(${unreadCount})`}
            </button>
          ))}
        </div>

        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search messages by name, email, subject..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 shadow-xs transition-all"
          />
        </div>
      </div>

      {/* Split View Container */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 min-h-125">
        {/* Message List Side */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden h-full">
            {loading ? (
              <div className="p-4 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-slate-100 h-20 rounded-xl w-full" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                <Inbox size={40} className="text-slate-300 mb-2" />
                <p className="text-slate-400 text-sm font-semibold">
                  {search ? "No messages match your search" : "No messages found"}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 overflow-y-auto max-h-137">
                {filtered.map((msg) => (
                  <button
                    key={msg._id}
                    onClick={() => handleOpen(msg)}
                    className={`w-full text-left px-4 py-3.5 transition-all hover:bg-slate-50/80 cursor-pointer ${selected?._id === msg._id
                      ? "bg-teal-50/60 border-r-4 border-r-teal-600"
                      : ""
                      }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        {msg.status === "unread" && (
                          <span className="w-2 h-2 rounded-full bg-teal-600 shrink-0" />
                        )}
                        <p
                          className={`text-sm truncate ${msg.status === "unread"
                            ? "font-bold text-slate-900"
                            : "font-semibold text-slate-700"
                            }`}
                        >
                          {msg.name}
                        </p>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {new Date(msg.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border mb-1.5 ${subjectColors[msg.subject] ||
                        "bg-slate-50 text-slate-700 border-slate-200"
                        }`}
                    >
                      {msg.subject}
                    </span>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {msg.message}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Message Detail Side */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs h-full flex flex-col overflow-hidden">
            {!selected ? (
              <div className="flex flex-col items-center justify-center h-full py-20 text-center px-6">
                <Mail size={48} className="text-slate-300 mb-3" />
                <p className="text-slate-500 text-sm font-semibold">
                  Select a message to read details
                </p>
                <p className="text-slate-400 text-xs mt-1">
                  Click on any message item from the list on the left.
                </p>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                {/* Detail Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${subjectColors[selected.subject] ||
                          "bg-slate-50 text-slate-700 border-slate-200"
                          }`}
                      >
                        {selected.subject}
                      </span>
                    </div>
                    <h3 className="text-base font-black text-slate-900">{selected.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(selected.createdAt).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDelete(selected._id)}
                    disabled={deletingId === selected._id}
                    className="shrink-0 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 flex items-center gap-1"
                  >
                    <Trash2 size={14} />
                    {deletingId === selected._id ? "..." : "Delete"}
                  </button>
                </div>

                {/* Sender Info Bar */}
                <div className="px-6 py-3.5 border-b border-slate-100/80 bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-sm font-black text-white shrink-0 shadow-xs">
                      {selected.name[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800">{selected.name}</p>
                      <a
                        href={buildMailto(selected)}
                        className="text-xs text-teal-600 hover:text-teal-700 underline underline-offset-2 transition-colors font-medium flex items-center gap-1"
                      >
                        {selected.email}
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Message Content */}
                <div className="px-6 py-5 flex-1 overflow-y-auto">
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {selected.message}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="px-6 py-4 border-t border-slate-100 flex flex-wrap gap-3">
                  <a
                    href={buildMailto(selected)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold shadow-xs transition-all cursor-pointer"
                  >
                    <Mail size={16} />
                    Reply via Email
                  </a>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selected.email);
                      toast.success(`Copied: ${selected.email}`);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-sm font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Copy size={15} />
                    Copy Email
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

