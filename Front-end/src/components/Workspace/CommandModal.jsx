import { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';

export default function CommandModal({ isOpen, onClose, onSave, onDelete, initialData }) {
  const [formData, setFormData] = useState({
    label: '',
    color: '#8ed1f7',
    code: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({ label: 'Lệnh mới', color: '#ffffff', code: 't.forward(50)' });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="neo-card bg-white w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-4 bg-[var(--yellow)] border-b-2 border-[var(--border)] flex justify-between items-center">
          <h3 className="font-black uppercase text-sm">Tùy chỉnh Lệnh 🛠️</h3>
          <button onClick={onClose} className="font-black text-xl hover:rotate-90 transition-transform">✕</button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-black mb-1">Tên nút bấm</label>
            <input 
              type="text" 
              value={formData.label}
              onChange={(e) => setFormData({...formData, label: e.target.value})}
              className="w-full neo-input py-2 px-3 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-black mb-1">Màu sắc</label>
            <div className="flex gap-2 flex-wrap">
              {['#ff5f56', '#ffbd2e', '#27c93f', '#8ed1f7', '#d18cf7', '#ff8eb2', '#ffffff'].map(c => (
                <button 
                  key={c}
                  onClick={() => setFormData({...formData, color: c})}
                  style={{ backgroundColor: c }}
                  className={`w-8 h-8 rounded-full border-2 border-[var(--border)] transition-transform ${formData.color === c ? 'scale-125 shadow-[2px_2px_0px_#000]' : 'hover:scale-110'}`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-black mb-1">Lệnh Python (Bé có thể viết nhiều dòng nhé! ✨)</label>
            <div className="border-2 border-[var(--border)] rounded-lg overflow-hidden h-48 shadow-inner">
              <CodeMirror
                value={formData.code}
                height="100%"
                theme={oneDark}
                extensions={[python()]}
                onChange={(val) => setFormData({...formData, code: val})}
                basicSetup={{ lineNumbers: true, foldGutter: false }}
                style={{ fontSize: '13px' }}
              />
            </div>
            <p className="text-[9px] font-bold text-gray-400 mt-1 italic">* Phép thuật của bé sẽ được lưu vĩnh viễn vào túi đồ đấy! 🎒✨</p>
          </div>
        </div>

        <div className="p-4 bg-[var(--bg)] border-t-2 border-[var(--border)] flex gap-3">
          {initialData && (
            <button 
              onClick={() => onDelete(initialData.index)} 
              className="neo-btn-secondary flex-1 py-2 bg-[var(--pink)] font-black text-xs uppercase"
            >
              XÓA 🗑️
            </button>
          )}
          <button 
            onClick={() => onSave(formData)}
            className="flex-1 neo-btn-primary py-2 bg-[var(--green)] font-black text-xs uppercase"
          >
            LƯU LẠI ✨
          </button>
        </div>
      </div>
    </div>
  );
}
