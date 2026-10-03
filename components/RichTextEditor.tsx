// components/RichTextEditor.tsx

"use client";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    ["blockquote", "code-block"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }],
    ["link", "image"],
    ["clean"],
  ],
};

const formats = [
  "header", "bold", "italic", "underline", "strike",
  "blockquote", "code-block", "list", "align", "link", "image"
];

interface Props {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
}
export default function RichTextEditor({ value, onChange, placeholder }: Props) {
  return (
    <div className="bg-white rounded-xl border border-(--color-border) overflow-hidden [&.ql-toolbar]:border-none [&.ql-toolbar]:border-b [&.ql-toolbar]:border-slate-200 [&.ql-container]:border-none [&.ql-editor]:min-h-87 [&.ql-editor]:text-base">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder || "Start typing your content..."}
      />
    </div>
  );
}
