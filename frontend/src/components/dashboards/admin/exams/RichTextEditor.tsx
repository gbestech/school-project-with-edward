// components/RichTextEditor.tsx
// import React, { useEffect } from "react";
// import { useEditor, EditorContent } from "@tiptap/react";
// import StarterKit from "@tiptap/starter-kit";
// import Link from "@tiptap/extension-link";
// import Image from "@tiptap/extension-image";
// import { Table } from "@tiptap/extension-table";
// import TableRow from "@tiptap/extension-table-row";
// import TableHeader from "@tiptap/extension-table-header";
// import TableCell from "@tiptap/extension-table-cell";

// interface RichTextEditorProps {
//   value: string;
//   onChange: (content: string) => void;
//   placeholder?: string;
//   readOnly?: boolean;
// }

// const MenuBar = ({ editor }: any) => {
//   if (!editor) return null;

//   const isTableActive = editor.isActive("table");

//   return (
//     <div className="bg-gray-100 border-b border-gray-300 p-2 flex flex-wrap gap-1 rounded-t-lg">
//       {/* Text Formatting */}
//       <button
//         onClick={() => editor.chain().focus().toggleBold().run()}
//         disabled={!editor.can().chain().focus().toggleBold().run()}
//         className={`px-3 py-1 rounded text-sm font-medium transition ${
//           editor.isActive("bold")
//             ? "bg-blue-600 text-white"
//             : "bg-white text-gray-700 hover:bg-gray-200"
//         }`}
//         title="Bold"
//       >
//         <strong>B</strong>
//       </button>
//       <button
//         onClick={() => editor.chain().focus().toggleItalic().run()}
//         disabled={!editor.can().chain().focus().toggleItalic().run()}
//         className={`px-3 py-1 rounded text-sm font-medium transition ${
//           editor.isActive("italic")
//             ? "bg-blue-600 text-white"
//             : "bg-white text-gray-700 hover:bg-gray-200"
//         }`}
//         title="Italic"
//       >
//         <em>I</em>
//       </button>
//       <button
//         onClick={() => editor.chain().focus().toggleStrike().run()}
//         disabled={!editor.can().chain().focus().toggleStrike().run()}
//         className={`px-3 py-1 rounded text-sm font-medium transition ${
//           editor.isActive("strike")
//             ? "bg-blue-600 text-white"
//             : "bg-white text-gray-700 hover:bg-gray-200"
//         }`}
//         title="Strikethrough"
//       >
//         <s>S</s>
//       </button>

//       <div className="w-px h-6 bg-gray-300 mx-1"></div>

//       {/* Headings */}
//       <button
//         onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
//         className={`px-3 py-1 rounded text-sm font-medium transition ${
//           editor.isActive("heading", { level: 1 })
//             ? "bg-blue-600 text-white"
//             : "bg-white text-gray-700 hover:bg-gray-200"
//         }`}
//         title="Heading 1"
//       >
//         H1
//       </button>
//       <button
//         onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
//         className={`px-3 py-1 rounded text-sm font-medium transition ${
//           editor.isActive("heading", { level: 2 })
//             ? "bg-blue-600 text-white"
//             : "bg-white text-gray-700 hover:bg-gray-200"
//         }`}
//         title="Heading 2"
//       >
//         H2
//       </button>

//       <div className="w-px h-6 bg-gray-300 mx-1"></div>

//       {/* Lists */}
//       <button
//         onClick={() => editor.chain().focus().toggleBulletList().run()}
//         className={`px-3 py-1 rounded text-sm font-medium transition ${
//           editor.isActive("bulletList")
//             ? "bg-blue-600 text-white"
//             : "bg-white text-gray-700 hover:bg-gray-200"
//         }`}
//         title="Bullet List"
//       >
//         • List
//       </button>
//       <button
//         onClick={() => editor.chain().focus().toggleOrderedList().run()}
//         className={`px-3 py-1 rounded text-sm font-medium transition ${
//           editor.isActive("orderedList")
//             ? "bg-blue-600 text-white"
//             : "bg-white text-gray-700 hover:bg-gray-200"
//         }`}
//         title="Numbered List"
//       >
//         1. List
//       </button>

//       <div className="w-px h-6 bg-gray-300 mx-1"></div>

//       {/* Code Block */}
//       <button
//         onClick={() => editor.chain().focus().toggleCodeBlock().run()}
//         className={`px-3 py-1 rounded text-sm font-medium transition ${
//           editor.isActive("codeBlock")
//             ? "bg-blue-600 text-white"
//             : "bg-white text-gray-700 hover:bg-gray-200"
//         }`}
//         title="Code Block"
//       >
//         {"</>"}
//       </button>
//       <button
//         onClick={() => editor.chain().focus().setHorizontalRule().run()}
//         className="px-3 py-1 rounded text-sm font-medium bg-white text-gray-700 hover:bg-gray-200 transition"
//         title="Horizontal Rule"
//       >
//         ― HR
//       </button>
//         <button
//         onClick={() => editor.chain().focus().toggleBlockquote().run()}
//         className={`px-3 py-1 rounded text-sm font-medium transition ${
//           editor.isActive("blockquote")
//         ? "bg-blue-600 text-white"
//         : "bg-white text-gray-700 hover:bg-gray-200"
//         }`}
//         title="Blockquote"
//       >
//         ❝ Quote
          
//         </button>
//         <button
//         onClick={() => editor.chain().focus().toggleUnderline().run()}
//         className={`px-3 py-1 rounded text-sm font-medium transition ${
//           editor.isActive("underline")
//         ? "bg-blue-600 text-white"    
//         : "bg-white text-gray-700 hover:bg-gray-200"
//         }`}
//         title="Underline"
//       >
//         Underline U 
//         </button>

//       <div className="w-px h-6 bg-gray-300 mx-1"></div>

//       {/* Table Controls */}
//       {!isTableActive ? (
//         <button
//           onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
//           className="px-3 py-1 rounded text-sm font-medium bg-white text-gray-700 hover:bg-gray-200 transition"
//           title="Insert Table"
//         >
//           ⊞ Table
//         </button>
//       ) : (
//         <>
//           <button
//             onClick={() => editor.chain().focus().addColumnBefore().run()}
//             className="px-2 py-1 rounded text-xs font-medium bg-white text-gray-700 hover:bg-gray-200 transition"
//             title="Add Column Before"
//           >
//             ←Col
//           </button>
//           <button
//             onClick={() => editor.chain().focus().addColumnAfter().run()}
//             className="px-2 py-1 rounded text-xs font-medium bg-white text-gray-700 hover:bg-gray-200 transition"
//             title="Add Column After"
//           >
//             Col→
//           </button>
//           <button
//             onClick={() => editor.chain().focus().deleteColumn().run()}
//             className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition"
//             title="Delete Column"
//           >
//             ✕Col
//           </button>
//           <button
//             onClick={() => editor.chain().focus().addRowBefore().run()}
//             className="px-2 py-1 rounded text-xs font-medium bg-white text-gray-700 hover:bg-gray-200 transition"
//             title="Add Row Before"
//           >
//             ↑Row
//           </button>
//           <button
//             onClick={() => editor.chain().focus().addRowAfter().run()}
//             className="px-2 py-1 rounded text-xs font-medium bg-white text-gray-700 hover:bg-gray-200 transition"
//             title="Add Row After"
//           >
//             Row↓
//           </button>
//           <button
//             onClick={() => editor.chain().focus().deleteRow().run()}
//             className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition"
//             title="Delete Row"
//           >
//             ✕Row
//           </button>
//           <button
//             onClick={() => editor.chain().focus().deleteTable().run()}
//             className="px-2 py-1 rounded text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition"
//             title="Delete Table"
//           >
//             ✕Table
//           </button>
//         </>
//       )}

//       <div className="w-px h-6 bg-gray-300 mx-1"></div>

//       {/* Image */}
//       <button
//         onClick={() => {
//           const url = prompt("Enter image URL:");
//           if (url) editor.chain().focus().setImage({ src: url }).run();
//         }}
//         className="px-3 py-1 rounded text-sm font-medium bg-white text-gray-700 hover:bg-gray-200 transition"
//         title="Insert Image"
//       >
//         🖼️ Image
//       </button>

//       {/* Link */}
//       <button
//         onClick={() => {
//           const url = prompt("Enter URL:");
//           if (url) editor.chain().focus().setLink({ href: url }).run();
//         }}
//         className={`px-3 py-1 rounded text-sm font-medium transition ${
//           editor.isActive("link")
//             ? "bg-blue-600 text-white"
//             : "bg-white text-gray-700 hover:bg-gray-200"
//         }`}
//         title="Insert Link"
//       >
//         🔗 Link
//       </button>

//       <div className="w-px h-6 bg-gray-300 mx-1"></div>

//       {/* Clear Formatting */}
//       <button
//         onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
//         className="px-3 py-1 rounded text-sm font-medium bg-white text-gray-700 hover:bg-gray-200 transition"
//         title="Clear Formatting"
//       >
//         Clear
//       </button>
//     </div>
//   );
// };

// const RichTextEditor: React.FC<RichTextEditorProps> = ({
//   value,
//   onChange,
//   placeholder = "Enter text...",
//   readOnly = false,
// }) => {
//   const editor = useEditor({
//     extensions: [
//       StarterKit,
//       Link.configure({ 
//         openOnClick: false,
//         HTMLAttributes: {
//           class: 'text-blue-600 underline hover:text-blue-800',
//         },
//       }),
//       Image.configure({
//         HTMLAttributes: {
//           class: 'max-w-full h-auto rounded',
//         },
//       }),
//       Table.configure({ 
//         resizable: true,
//         HTMLAttributes: {
//           class: 'border-collapse table-auto w-full my-4',
//         },
//       }),
//       TableRow.configure({
//         HTMLAttributes: {
//           class: 'border border-gray-300',
//         },
//       }),
//       TableHeader.configure({
//         HTMLAttributes: {
//           class: 'border border-gray-300 bg-gray-100 px-4 py-2 text-left font-semibold',
//         },
//       }),
//       TableCell.configure({
//         HTMLAttributes: {
//           class: 'border border-gray-300 px-4 py-2',
//         },
//       }),
//     ],
//     content: value,
//     onUpdate: ({ editor }) => {
//       onChange(editor.getHTML());
//     },
//     editable: !readOnly,
//     editorProps: {
//       attributes: {
//         class: 'prose prose-sm max-w-none focus:outline-none',
//       },
//     },
//   });

//   // Update editor content when value changes externally
//   useEffect(() => {
//     if (editor && value !== editor.getHTML()) {
//       editor.commands.setContent(value);
//     }
//   }, [editor, value]);

//   return (
//     <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm">
//       {!readOnly && <MenuBar editor={editor} />}
//       <EditorContent
//         editor={editor}
//         className="px-4 py-3 min-h-[150px] bg-white focus-within:bg-gray-50"
//       />
//       {!readOnly && (
//         <div className="bg-gray-50 border-t border-gray-300 px-4 py-2 text-xs text-gray-500">
//           {placeholder}
//         </div>
//       )}
//     </div>
//   );
// };

// export default RichTextEditor;

// components/RichTextEditor.tsx
import React, { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import Underline from "@tiptap/extension-underline";

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}

const MenuBar = ({ editor }: any) => {
  const [showShapes, setShowShapes] = useState(false);

  if (!editor) return null;

  const isTableActive = editor.isActive("table");

  const shapes = [
    { label: "Circle", symbol: "●" },
    { label: "Square", symbol: "■" },
    { label: "Triangle", symbol: "▲" },
    { label: "Diamond", symbol: "◆" },
    { label: "Star", symbol: "★" },
    { label: "Heart", symbol: "♥" },
    { label: "Arrow Right", symbol: "→" },
    { label: "Arrow Left", symbol: "←" },
    { label: "Arrow Up", symbol: "↑" },
    { label: "Arrow Down", symbol: "↓" },
    { label: "Check", symbol: "✓" },
    { label: "Cross", symbol: "✗" },
    { label: "Circle Outline", symbol: "○" },
    { label: "Square Outline", symbol: "□" },
    { label: "Triangle Outline", symbol: "△" },
    { label: "Pentagon", symbol: "⬟" },
  ];

  const insertShape = (symbol: string) => {
    editor.chain().focus().insertContent(symbol).run();
    setShowShapes(false);
  };

  return (
    <div className="bg-gray-100 border-b border-gray-300 p-2 flex flex-wrap gap-1 rounded-t-lg relative">
      {/* Text Formatting */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`px-3 py-1 rounded text-sm font-medium transition ${
          editor.isActive("bold")
            ? "bg-blue-600 text-white"
            : "bg-white text-gray-700 hover:bg-gray-200"
        }`}
        title="Bold"
      >
        <strong>B</strong>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`px-3 py-1 rounded text-sm font-medium transition ${
          editor.isActive("italic")
            ? "bg-blue-600 text-white"
            : "bg-white text-gray-700 hover:bg-gray-200"
        }`}
        title="Italic"
      >
        <em>I</em>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={`px-3 py-1 rounded text-sm font-medium transition ${
          editor.isActive("strike")
            ? "bg-blue-600 text-white"
            : "bg-white text-gray-700 hover:bg-gray-200"
        }`}
        title="Strikethrough"
      >
        <s>S</s>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`px-3 py-1 rounded text-sm font-medium transition ${
          editor.isActive("underline")
            ? "bg-blue-600 text-white"
            : "bg-white text-gray-700 hover:bg-gray-200"
        }`}
        title="Underline"
      >
        <u>U</u>
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      {/* Headings */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`px-3 py-1 rounded text-sm font-medium transition ${
          editor.isActive("heading", { level: 1 })
            ? "bg-blue-600 text-white"
            : "bg-white text-gray-700 hover:bg-gray-200"
        }`}
        title="Heading 1"
      >
        H1
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`px-3 py-1 rounded text-sm font-medium transition ${
          editor.isActive("heading", { level: 2 })
            ? "bg-blue-600 text-white"
            : "bg-white text-gray-700 hover:bg-gray-200"
        }`}
        title="Heading 2"
      >
        H2
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      {/* Lists */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`px-3 py-1 rounded text-sm font-medium transition ${
          editor.isActive("bulletList")
            ? "bg-blue-600 text-white"
            : "bg-white text-gray-700 hover:bg-gray-200"
        }`}
        title="Bullet List"
      >
        • List
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`px-3 py-1 rounded text-sm font-medium transition ${
          editor.isActive("orderedList")
            ? "bg-blue-600 text-white"
            : "bg-white text-gray-700 hover:bg-gray-200"
        }`}
        title="Numbered List"
      >
        1. List
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      {/* Code Block */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`px-3 py-1 rounded text-sm font-medium transition ${
          editor.isActive("codeBlock")
            ? "bg-blue-600 text-white"
            : "bg-white text-gray-700 hover:bg-gray-200"
        }`}
        title="Code Block"
      >
        {"</>"}
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className="px-3 py-1 rounded text-sm font-medium bg-white text-gray-700 hover:bg-gray-200 transition"
        title="Horizontal Rule"
      >
        ― HR
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`px-3 py-1 rounded text-sm font-medium transition ${
          editor.isActive("blockquote")
            ? "bg-blue-600 text-white"
            : "bg-white text-gray-700 hover:bg-gray-200"
        }`}
        title="Blockquote"
      >
        ❝ Quote
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      {/* Table Controls */}
      {!isTableActive ? (
        <button
          type="button"
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
          className="px-3 py-1 rounded text-sm font-medium bg-white text-gray-700 hover:bg-gray-200 transition"
          title="Insert Table"
        >
          ⊞ Table
        </button>
      ) : (
        <>
          <button
            type="button"
            onClick={() => editor.chain().focus().addColumnBefore().run()}
            className="px-2 py-1 rounded text-xs font-medium bg-white text-gray-700 hover:bg-gray-200 transition"
            title="Add Column Before"
          >
            ←Col
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            className="px-2 py-1 rounded text-xs font-medium bg-white text-gray-700 hover:bg-gray-200 transition"
            title="Add Column After"
          >
            Col→
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteColumn().run()}
            className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition"
            title="Delete Column"
          >
            ✕Col
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().addRowBefore().run()}
            className="px-2 py-1 rounded text-xs font-medium bg-white text-gray-700 hover:bg-gray-200 transition"
            title="Add Row Before"
          >
            ↑Row
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().addRowAfter().run()}
            className="px-2 py-1 rounded text-xs font-medium bg-white text-gray-700 hover:bg-gray-200 transition"
            title="Add Row After"
          >
            Row↓
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteRow().run()}
            className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition"
            title="Delete Row"
          >
            ✕Row
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteTable().run()}
            className="px-2 py-1 rounded text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition"
            title="Delete Table"
          >
            ✕Table
          </button>
        </>
      )}

      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      {/* Image */}
      <button
        type="button"
        onClick={() => {
          const url = prompt("Enter image URL:");
          if (url) editor.chain().focus().setImage({ src: url }).run();
        }}
        className="px-3 py-1 rounded text-sm font-medium bg-white text-gray-700 hover:bg-gray-200 transition"
        title="Insert Image"
      >
        🖼️ Image
      </button>

      {/* Link */}
      <button
        type="button"
        onClick={() => {
          const url = prompt("Enter URL:");
          if (url) editor.chain().focus().setLink({ href: url }).run();
        }}
        className={`px-3 py-1 rounded text-sm font-medium transition ${
          editor.isActive("link")
            ? "bg-blue-600 text-white"
            : "bg-white text-gray-700 hover:bg-gray-200"
        }`}
        title="Insert Link"
      >
        🔗 Link
      </button>

      {/* Shapes/Symbols */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowShapes(!showShapes)}
          className="px-3 py-1 rounded text-sm font-medium bg-white text-gray-700 hover:bg-gray-200 transition"
          title="Insert Shape/Symbol"
        >
          ◆ Shapes
        </button>
        {showShapes && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg p-2 z-10 grid grid-cols-4 gap-1 max-h-64 overflow-y-auto">
            {shapes.map((shape) => (
              <button
                type="button"
                key={shape.label}
                onClick={() => insertShape(shape.symbol)}
                className="px-3 py-2 text-2xl hover:bg-blue-100 rounded transition"
                title={shape.label}
              >
                {shape.symbol}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      {/* Clear Formatting */}
      <button
        type="button"
        onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
        className="px-3 py-1 rounded text-sm font-medium bg-white text-gray-700 hover:bg-gray-200 transition"
        title="Clear Formatting"
      >
        Clear
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
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline hover:text-blue-800",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded",
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "border-collapse table-auto w-full my-4",
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: "border border-gray-300",
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: "border border-gray-300 bg-gray-100 px-4 py-2 text-left font-semibold",
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: "border border-gray-300 px-4 py-2",
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editable: !readOnly,
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none",
      },
    },
  });

  // Update editor content when value changes externally
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm">
      {!readOnly && <MenuBar editor={editor} />}
      <EditorContent
        editor={editor}
        className="px-4 py-3 min-h-[150px] bg-white focus-within:bg-gray-50"
      />
      {!readOnly && (
        <div className="bg-gray-50 border-t border-gray-300 px-4 py-2 text-xs text-gray-500">
          {placeholder}
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;