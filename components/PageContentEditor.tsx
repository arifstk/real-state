// components/PageContentEditor.tsx

"use client";
import { useState, useEffect } from "react";
import RichTextEditor from "./RichTextEditor";

interface Props {
  slug: string;
  title: string;
}

export default function PageContentEditor({ slug, title }: Props) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/pages/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.page) setContent(data.page.content || "");
      })
      .catch(() => alert("Failed to load page content"))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/pages/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`${title} updated successfully!`);
      } else {
        alert("Failed to save changes.");
      }
    } catch {
      alert("Error saving page content.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-(--color-text)">{title}</h2>
          <p className="text-xs text-slate-400 mt-0.5">Manage rich text content rendered on the live website</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="px-5 py-2.5 rounded-xl btn-primary text-white text-sm font-medium transition-all shadow-lg shadow-(--color-primary)/20 disabled:opacity-50 cursor-pointer"
        >
          {saving ? "Saving..." : "💾 Save Changes"}
        </button>
      </div>

      {loading ? (
        <div className="h-64 rounded-xl bg-slate-100 animate-pulse flex items-center justify-center text-slate-400 text-sm">
          Loading Content Editor...
        </div>
      ) : (
        <RichTextEditor value={content} onChange={setContent} />
      )}
    </div>
  );
}

