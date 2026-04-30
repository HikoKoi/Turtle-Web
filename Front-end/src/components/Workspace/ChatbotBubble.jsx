import { useState } from 'react';

export default function ChatbotBubble() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      {/* Cửa sổ chat mini */}
      {isOpen && (
        <div className="w-80 h-96 neo-card bg-white flex flex-col overflow-hidden mb-2 animate-in slide-in-from-bottom-5">
          <div className="p-3 bg-[var(--cyan)] border-b-2 border-[var(--border)] flex justify-between items-center">
            <span className="font-black text-sm uppercase">Gia sư Rùa 🐢</span>
            <button onClick={() => setIsOpen(false)} className="font-black">✕</button>
          </div>
          <div className="flex-1 p-4 bg-[var(--bg)] overflow-y-auto text-sm font-bold">
            <div className="bg-white p-3 rounded-xl border-2 border-[var(--border)] shadow-[2px_2px_0px_#1a1a1a] mb-4">
              Chào Hiệp sĩ! Con cần ta giúp gì về code Rùa không? 🐢✨
            </div>
          </div>
          <div className="p-3 border-t-2 border-[var(--border)] bg-white flex gap-2">
            <input 
              type="text" 
              placeholder="Hỏi ta bất cứ gì..." 
              className="flex-1 bg-transparent border-none outline-none text-xs font-bold"
            />
            <button className="bg-[var(--cyan)] px-3 py-1 border-2 border-[var(--border)] rounded font-black text-xs">GỬI</button>
          </div>
        </div>
      )}

      {/* Nút bấm nổi */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-[var(--cyan)] rounded-full border-[3px] border-[var(--border)] shadow-[4px_4px_0px_#1a1a1a] flex items-center justify-center text-4xl hover:scale-110 active:scale-95 transition-all"
      >
        🐢
      </button>
    </div>
  );
}
