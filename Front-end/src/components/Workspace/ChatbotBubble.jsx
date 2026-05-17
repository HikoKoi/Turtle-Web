import { useState, useEffect, useRef } from 'react';
import aiApi from '../../api/aiApi';
import { useAuth } from '../../hooks/useAuth';

export default function ChatbotBubble({ currentCode, errorLog }) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    if (!user) return [];
    try {
      const cached = localStorage.getItem(`turtle_chat_history_${user.username}`);
      return cached ? JSON.parse(cached) : [];
    } catch { return []; }
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasNotification, setHasNotification] = useState(false);
  const scrollRef = useRef(null);
  const lastErrorRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen && user) {
      setHasNotification(false);
      loadHistory();
    }
  }, [isOpen]);

  // TỰ ĐỘNG BẮT LỖI
  useEffect(() => {
    if (errorLog && errorLog.msg) {
      handleSend(null, errorLog.msg);
    }
  }, [errorLog]);

  const loadHistory = async () => {
    try {
      const { data } = await aiApi.getHistory();
      const newMsgs = data.length > 0 ? data : [{ role: 'assistant', content: 'Chào Hiệp sĩ! Ta là Rùa già thông thái đây. 🐢✨' }];
      setMessages(newMsgs);
      if (user) localStorage.setItem(`turtle_chat_history_${user.username}`, JSON.stringify(newMsgs));
    } catch (err) { console.error(err); }
  };

  // Tự động lưu lịch sử vào cache mỗi khi có tin nhắn mới (chạy cả khi đang stream)
  useEffect(() => {
    if (user && messages.length > 0) {
      localStorage.setItem(`turtle_chat_history_${user.username}`, JSON.stringify(messages));
    }
  }, [messages, user]);

  const handleSend = async (manualMsg = null, hiddenError = null) => {
    const userMsg = manualMsg || input;
    if (!userMsg && !hiddenError) return;
    if (isLoading) return;

    if (!manualMsg) setInput('');
    if (!hiddenError) setMessages(prev => [...prev, { role: 'user', content: userMsg }]);

    setIsLoading(true);


    try {
      const response = await fetch('http://localhost:8000/api/ai/chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ message: userMsg, code: currentCode, error: hiddenError })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiMsg = "";
      let hasTriggeredNoti = false; // Biến phụ để chỉ hiện thông báo 1 lần
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        // Kiểm tra trạng thái thực tế ngay lúc này (tránh bị kẹt giá trị cũ)
        setIsOpen(currentIsOpen => {
          if (!currentIsOpen && !hasTriggeredNoti) {
            setHasNotification(true);
            hasTriggeredNoti = true;
          }
          return currentIsOpen;
        });

        aiMsg += decoder.decode(value, { stream: true });
        setMessages(prev => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1].content = aiMsg;
          return newMsgs;
        });
      }
    } catch (err) { console.error(err); } finally { setIsLoading(false); }
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      {isOpen && (
        <div className="w-80 md:w-96 h-[500px] neo-card bg-white flex flex-col overflow-hidden mb-2 shadow-[8px_8px_0px_#000]">
          {/* Header */}
          <div className="p-4 bg-[var(--cyan)] border-b-2 border-black flex justify-between items-center">
            <span className="font-black uppercase text-sm">Gia sư Rùa thông thái</span>
            <button onClick={() => setIsOpen(false)} className="font-black">✕</button>
          </div>

          {/* Chat Window */}
          <div ref={scrollRef} className="flex-1 p-4 bg-[var(--bg)] overflow-y-auto space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl font-bold text-sm border-2 border-black shadow-[3px_3px_0px_#000] whitespace-pre-wrap ${msg.role === 'user' ? 'bg-[var(--orange)]' : 'bg-white'
                  }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && <div className="text-xs font-black animate-pulse">🐢 Ta đang suy nghĩ...</div>}
          </div>

          {/* Input */}
          <div className="p-3 border-t-2 border-black bg-white flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSend()} className="flex-1 bg-gray-100 p-2 rounded-lg outline-none font-bold text-xs" placeholder="Hỏi sư phụ..." />
            <button onClick={() => handleSend()} className="bg-[var(--cyan)] px-4 py-2 border-2 border-black rounded-lg font-black text-xs shadow-[2px_2px_0px_#000]">GỬI</button>
          </div>
        </div>
      )}

      {/* Nút Floating với dấu ! thông báo */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setHasNotification(false); // Click vào là mất dấu !
        }}
        className={`w-16 h-16 rounded-full border-[3px] border-[var(--border)] shadow-[4px_4px_0px_#1a1a1a] relative flex items-center justify-center text-4xl hover:scale-110 active:scale-95 transition-all ${isOpen ? 'bg-[var(--pink)]' : 'bg-[var(--cyan)]'
          }`}
      >
        {isOpen ? '✕' : '🐢'}
        {/* ĐÂY LÀ ĐOẠN HIỂN THỊ DẤU CHẤM ĐỎ - BẠN ĐANG THIẾU NÓ */}
        {!isOpen && hasNotification && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[10px] font-black text-white animate-bounce shadow-lg">
            !
          </div>
        )}
      </button>
    </div>
  );
}
