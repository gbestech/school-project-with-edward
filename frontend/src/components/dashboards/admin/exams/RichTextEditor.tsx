
// components/RichTextEditor.tsx
import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import {Table} from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}

const MenuBar = ({ editor }: any) => {
  if (!editor) return null;

  return (
    <div className="bg-gray-100 border-b border-gray-300 p-2 flex flex-wrap gap-1 rounded-t-lg">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`px-3 py-1 rounded text-sm font-medium transition ${
          editor.isActive("bold")
            ? "bg-blue-600 text-white"
            : "bg-white text-gray-700 hover:bg-gray-200"
        }`}
      >
        Bold
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`px-3 py-1 rounded text-sm font-medium transition ${
          editor.isActive("italic")
            ? "bg-blue-600 text-white"
            : "bg-white text-gray-700 hover:bg-gray-200"
        }`}
      >
        Italic
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={`px-3 py-1 rounded text-sm font-medium transition ${
          editor.isActive("strike")
            ? "bg-blue-600 text-white"
            : "bg-white text-gray-700 hover:bg-gray-200"
        }`}
      >
        Strike
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`px-3 py-1 rounded text-sm font-medium transition ${
          editor.isActive("heading", { level: 1 })
            ? "bg-blue-600 text-white"
            : "bg-white text-gray-700 hover:bg-gray-200"
        }`}
      >
        H1
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`px-3 py-1 rounded text-sm font-medium transition ${
          editor.isActive("heading", { level: 2 })
            ? "bg-blue-600 text-white"
            : "bg-white text-gray-700 hover:bg-gray-200"
        }`}
      >
        H2
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`px-3 py-1 rounded text-sm font-medium transition ${
          editor.isActive("bulletList")
            ? "bg-blue-600 text-white"
            : "bg-white text-gray-700 hover:bg-gray-200"
        }`}
      >
        Bullet List
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`px-3 py-1 rounded text-sm font-medium transition ${
          editor.isActive("orderedList")
            ? "bg-blue-600 text-white"
            : "bg-white text-gray-700 hover:bg-gray-200"
        }`}
      >
        Ordered List
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`px-3 py-1 rounded text-sm font-medium transition ${
          editor.isActive("codeBlock")
            ? "bg-blue-600 text-white"
            : "bg-white text-gray-700 hover:bg-gray-200"
        }`}
      >
        Code
      </button>
      <button
        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        className="px-3 py-1 rounded text-sm font-medium bg-white text-gray-700 hover:bg-gray-200 transition"
      >
        Table
      </button>
      <button
        onClick={() => {
          const url = prompt("Enter image URL:");
          if (url) editor.chain().focus().setImage({ src: url }).run();
        }}
        className="px-3 py-1 rounded text-sm font-medium bg-white text-gray-700 hover:bg-gray-200 transition"
      >
        Image
      </button>
      <button
        onClick={() => editor.chain().focus().setLink({ href: prompt("Enter URL:") || "" }).run()}
        className={`px-3 py-1 rounded text-sm font-medium transition ${
          editor.isActive("link")
            ? "bg-blue-600 text-white"
            : "bg-white text-gray-700 hover:bg-gray-200"
        }`}
      >
        Link
      </button>
      <button
        onClick={() => editor.chain().focus().clearNodes().run()}
        className="px-3 py-1 rounded text-sm font-medium bg-white text-gray-700 hover:bg-gray-200 transition"
      >
        Clear Format
      </button>
    </div>
  );
};

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Enter text...",
  readOnly = false,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Image,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editable: !readOnly,
  });

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm">
      {!readOnly && <MenuBar editor={editor} />}
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none px-4 py-3 min-h-[150px] bg-white focus:outline-none"
      />
    </div>
  );
};

export default RichTextEditor;
