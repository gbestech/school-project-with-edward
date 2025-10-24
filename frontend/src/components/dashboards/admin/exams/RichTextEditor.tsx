import React, { useMemo } from 'react';
// @ts-ignore - react-quill has no type declarations in this project
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Enter content...',
  minHeight = '150px',
}) => {
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'color': [] }, { 'background': [] }],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        image: function(this: any) {
          const input = document.createElement('input');
          input.setAttribute('type', 'file');
          input.setAttribute('accept', 'image/*');
          input.click();

          input.onchange = async () => {
            const file = input.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (e) => {
                const range = this.quill.getSelection(true);
                this.quill.insertEmbed(range.index, 'image', e.target?.result);
              };
              reader.readAsDataURL(file);
            }
          };
        }
      }
    },
    clipboard: {
      matchVisual: false
    }
  }), []);

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'script',
    'list', 'bullet',
    'color', 'background',
    'link', 'image'
  ];

  return (
    <div className="rich-text-editor-wrapper">
      <ReactQuill
        theme="snow"
        value={value || ''}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        style={{ minHeight }}
      />
      <style>{`
        .rich-text-editor-wrapper .ql-container {
          font-size: 14px;
          min-height: ${minHeight};
        }
        .rich-text-editor-wrapper .ql-editor {
          min-height: ${minHeight};
        }
        .rich-text-editor-wrapper .ql-editor img {
          max-width: 100%;
          height: auto;
        }
        .rich-text-editor-wrapper .ql-editor table {
          border-collapse: collapse;
          width: 100%;
        }
        .rich-text-editor-wrapper .ql-editor table td,
        .rich-text-editor-wrapper .ql-editor table th {
          border: 1px solid #ddd;
          padding: 8px;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;