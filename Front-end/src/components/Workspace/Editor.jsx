import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';

export default function Editor({ code, onChange }) {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden neo-card bg-[#282c34]">
      {/* Header của Editor */}
      <div className="flex items-center justify-between px-4 py-2 border-b-[2px] border-[var(--border)] bg-[#21252b]">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
            <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
          </div>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">
            main.py
          </span>
        </div>
        <div className="text-[10px] font-black text-[var(--orange)]">PYTHON 3</div>
      </div>

      {/* Vùng gõ code - Cố định bằng relative/absolute để ép cuộn */}
      <div className="flex-1 relative">
        <div className="absolute inset-0">
          <CodeMirror
            value={code}
            height="100%"
            theme={oneDark}
            extensions={[python()]}
            onChange={(value) => onChange(value)}
            basicSetup={{
              lineNumbers: true,
              foldGutter: true,
              highlightActiveLine: true,
              dropCursor: true,
              allowMultipleSelections: true,
              indentOnInput: true,
              scrollPastEnd: true,
            }}
            className="h-full"
            style={{ fontSize: '14px' }}
          />
        </div>
      </div>
    </div>
  );
}
