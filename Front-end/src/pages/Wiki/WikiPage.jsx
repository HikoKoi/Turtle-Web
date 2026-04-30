import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TURTLE_COMMANDS = [
  // --- NHÓM DI CHUYỂN ---
  { id: 'forward', name: 'forward(khoảng cách)', icon: '➡️', desc: 'Di chuyển Rùa tiến về phía trước.', example: 't.forward(100)', category: 'Di chuyển' },
  { id: 'backward', name: 'backward(khoảng cách)', icon: '⬅️', desc: 'Di chuyển Rùa lùi về phía sau.', example: 't.backward(50)', category: 'Di chuyển' },
  { id: 'right', name: 'right(độ)', icon: '↪️', desc: 'Xoay Rùa sang bên phải theo số độ.', example: 't.right(90)', category: 'Di chuyển' },
  { id: 'left', name: 'left(độ)', icon: '↩️', desc: 'Xoay Rùa sang bên trái theo số độ.', example: 't.left(45)', category: 'Di chuyển' },
  { id: 'goto', name: 'goto(x, y)', icon: '📍', desc: 'Dịch chuyển Rùa đến một tọa độ cụ thể.', example: 't.goto(100, 100)', category: 'Di chuyển' },
  { id: 'setheading', name: 'setheading(độ)', icon: '🧭', desc: 'Xoay Rùa theo một hướng cố định (0: phải, 90: lên, 180: trái, 270: xuống).', example: 't.setheading(90)', category: 'Di chuyển' },
  { id: 'home', name: 'home()', icon: '🏠', desc: 'Đưa Rùa về vị trí trung tâm (0,0).', example: 't.home()', category: 'Di chuyển' },

  // --- NHÓM VẼ & HÌNH DẠNG ---
  { id: 'circle', name: 'circle(bán kính)', icon: '⭕', desc: 'Vẽ một hình tròn hoặc hình cung.', example: 't.circle(50)', category: 'Vẽ hình' },
  { id: 'dot', name: 'dot(kích thước)', icon: '🌑', desc: 'Vẽ một chấm tròn tại vị trí hiện tại.', example: 't.dot(20)', category: 'Vẽ hình' },
  { id: 'stamp', name: 'stamp()', icon: '📮', desc: 'Để lại một hình ảnh con rùa trên màn hình.', example: 't.stamp()', category: 'Vẽ hình' },
  { id: 'shape', name: 'shape("hình")', icon: '🐢', desc: 'Đổi hình dáng Rùa (turtle, arrow, circle, square...).', example: 't.shape("turtle")', category: 'Vẽ hình' },
  { id: 'write', name: 'write("nội dung")', icon: '✍️', desc: 'Viết chữ lên màn hình sân chơi.', example: 't.write("Chào các bạn!", font=("Arial", 16, "bold"))', category: 'Vẽ hình' },

  // --- NHÓM MÀU SẮC & BÚT VẼ ---
  { id: 'color', name: 'color("màu")', icon: '🎨', desc: 'Đổi màu cho nét vẽ và màu tô.', example: 't.color("red")', category: 'Màu sắc' },
  { id: 'bgcolor', name: 'bgcolor("màu")', icon: '🖼️', desc: 'Thay đổi màu nền của sân chơi Rùa.', example: 'import turtle\nscreen = turtle.Screen()\nscreen.bgcolor("lightblue")', category: 'Màu sắc' },
  { id: 'pensize', name: 'pensize(độ dày)', icon: '✏️', desc: 'Thay đổi độ đậm nhạt của nét vẽ.', example: 't.pensize(5)', category: 'Màu sắc' },
  { id: 'begin_fill', name: 'begin_fill()', icon: '🧪', desc: 'Bắt đầu đánh dấu vùng cần tô màu.', example: 't.begin_fill()', category: 'Màu sắc' },
  { id: 'end_fill', name: 'end_fill()', icon: '🌈', desc: 'Kết thúc và tô màu cho hình vừa vẽ.', example: 't.begin_fill()\nt.circle(50)\nt.end_fill()', category: 'Màu sắc' },

  // --- NHÓM ĐIỀU KHIỂN ---
  { id: 'penup', name: 'penup()', icon: '🕊️', desc: 'Nhấc bút lên để di chuyển mà không để lại nét vẽ.', example: 't.penup()', category: 'Điều khiển' },
  { id: 'pendown', name: 'pendown()', icon: '✍️', desc: 'Đặt bút xuống để bắt đầu vẽ lại.', example: 't.pendown()', category: 'Điều khiển' },
  { id: 'speed', name: 'speed(tốc độ)', icon: '⚡', desc: 'Chỉnh tốc độ chạy (0: nhanh nhất, 1: chậm, 10: nhanh).', example: 't.speed(0)', category: 'Điều khiển' },
  { id: 'hideturtle', name: 'hideturtle()', icon: '👻', desc: 'Ẩn chú Rùa đi để chỉ thấy nét vẽ.', example: 't.hideturtle()', category: 'Điều khiển' },
  { id: 'showturtle', name: 'showturtle()', icon: '👀', desc: 'Hiện chú Rùa trở lại màn hình.', example: 't.showturtle()', category: 'Điều khiển' },
  { id: 'clear', name: 'clear()', icon: '🧼', desc: 'Xóa mọi nét vẽ nhưng giữ nguyên vị trí Rùa.', example: 't.clear()', category: 'Điều khiển' },
  { id: 'reset', name: 'reset()', icon: '🧹', desc: 'Xóa hết và đưa Rùa về trạng thái ban đầu.', example: 't.reset()', category: 'Điều khiển' },
  { id: 'undo', name: 'undo()', icon: '⏪', desc: 'Hoàn tác (quay lại) một bước vẽ trước đó.', example: 't.undo()', category: 'Điều khiển' },
];

export default function WikiPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');

  const categories = ['Tất cả', ...new Set(TURTLE_COMMANDS.map(c => c.category))];

  const filteredCommands = TURTLE_COMMANDS.filter(cmd => {
    const matchesSearch = cmd.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         cmd.desc.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Tất cả' || cmd.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[var(--bg)] p-4 md:p-8 font-nunito flex flex-col items-center">
      {/* Header */}
      <div className="w-full max-w-6xl mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex-1">
            <button onClick={() => navigate('/')} className="neo-btn-secondary py-2 px-6 bg-white mb-6 transition-all active:translate-y-1">🔙 QUAY LẠI XƯỞNG VẼ</button>
            <h1 className="text-4xl font-black uppercase tracking-widest flex items-center gap-4">📖 Wiki Rùa Thần Thông</h1>
            <p className="text-gray-500 font-bold mt-2 italic">Nơi lưu giữ mọi phép thuật diệu kỳ của chú Rùa 🐢✨</p>
          </div>

          <div className="flex flex-col gap-4 w-full md:w-96">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Tìm phép thuật... ✨"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-4 border-4 border-[var(--border)] rounded-xl font-bold bg-white shadow-[6px_6px_0px_#1a1a1a] outline-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl">🔍</span>
            </div>
          </div>
        </div>

        {/* Categories Filter */}
        <div className="flex flex-wrap gap-2 mt-8">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg font-black text-xs border-2 border-[var(--border)] transition-all shadow-[3px_3px_0px_#000] active:shadow-none active:translate-x-1 active:translate-y-1 ${
                selectedCategory === cat ? 'bg-[var(--orange)]' : 'bg-white hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Danh sách lệnh */}
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
        {filteredCommands.map((cmd) => (
          <div key={cmd.id} className="neo-card bg-white p-5 flex flex-col gap-3 group">
            <div className="flex items-center justify-between">
               <div className="w-10 h-10 bg-[var(--yellow)] border-2 border-[var(--border)] rounded-xl flex items-center justify-center text-xl shadow-[3px_3px_0px_#000]">
                  {cmd.icon}
               </div>
               <span className="text-[8px] font-black bg-[var(--bg)] px-2 py-1 border border-[var(--border)] rounded uppercase tracking-tighter">
                  {cmd.category}
               </span>
            </div>

            <h3 className="font-black text-xs text-[var(--cyan-dark)] uppercase leading-tight truncate" title={cmd.name}>
              {cmd.name}
            </h3>

            <p className="text-[11px] font-bold text-gray-500 leading-snug min-h-[44px]">
              {cmd.desc}
            </p>

            <div className="mt-2 pt-3 border-t-2 border-[var(--bg)] relative">
              <div className="bg-gray-900 p-3 rounded-lg overflow-hidden group/code">
                <code className="text-[var(--green)] font-mono text-[10px] font-bold block whitespace-pre">
                  {cmd.example}
                </code>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(cmd.example);
                    alert('Đã lấy phép thuật! Bé hãy dán vào xưởng vẽ nhé! 📋✨');
                  }}
                  className="absolute right-2 top-5 bg-[var(--cyan)] border-2 border-black text-[9px] font-black px-2 py-1 rounded shadow-[2px_2px_0px_#000] active:shadow-none opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  COPY
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredCommands.length === 0 && (
          <div className="col-span-full py-20 text-center">
             <div className="text-6xl mb-4">🐢❓</div>
             <p className="font-black text-gray-400">Rùa chưa học được phép thuật này... Thử từ khác nhé!</p>
          </div>
        )}
      </div>
    </div>
  );
}
