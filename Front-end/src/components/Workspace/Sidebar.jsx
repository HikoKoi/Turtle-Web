import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useProjects } from '../../contexts/ProjectContext';
import { useNavigate } from 'react-router-dom';
import lessonApi from '../../api/lessonApi';

export const STAGE_TITLES = {
  1: 'Đánh thức Rùa Họa sĩ 🐢',
  2: 'Bộ cọ vẽ đa sắc 🎨',
  3: 'Chiếc hộp thần kỳ 📦',
  4: 'Vòng lặp vạn hoa 🔄',
  5: 'Đưa Rùa bay lượn 🚀',
  6: 'Phép thuật quyết định 🚦',
  7: 'Vòng xoáy vô tận ⏳',
  8: 'Bửu bối đa sắc 🌈',
  9: 'Tự chế phép thuật 🔮',
  10: 'Phép thuật biến hóa 🪄'
};

const SAMPLE_PROGRAMS = [
  {
    title: 'Đường Hầm Siêu Tốc',
    code: 'import turtle\nt = turtle.Turtle()\nt.speed(0)\ncolors = ["red", "purple", "blue", "green", "orange", "yellow"]\nfor x in range(120):\n    t.pencolor(colors[x % 6])\n    t.width(x / 100 + 1)\n    t.forward(x * 2)\n    t.left(59)\n'
  },
  {
    title: 'Vẽ Ngôi Sao',
    code: 'import turtle\nt = turtle.Turtle()\nt.speed(3)\nt.color("red")\nfor i in range(5):\n    t.forward(150)\n    t.right(144)\n'
  },
  {
    title: 'Hình tròn đa sắc',
    code: 'import turtle\nt = turtle.Turtle()\nt.speed(0)\ncolors = ["red", "purple", "blue", "green", "orange", "yellow"]\nfor x in range(36):\n    t.pencolor(colors[x % 6])\n    t.circle(50)\n    t.left(10)\n'
  }
];

export default function Sidebar({ 
  onLoadProject, 
  onNewProject, 
  onPlaygroundClick, 
  onResetPlayground, 
  hasUnsavedChanges,
  completedStages = [],
  selectedTitle = "Hiệp Sĩ Tập Sự ⚔️",
  activeStage = null,
  onStageClick
}) {
  const { user, logout } = useAuth();
  const { projects, fetchProjects } = useProjects();
  const navigate = useNavigate();

  const [activeMenu, setActiveMenu] = useState(user ? 'Hành trình của bé' : 'Playground');
  const [expandedMenu, setExpandedMenu] = useState(user ? 'Hành trình của bé' : 'Playground');
  const [isCollapsed, setIsCollapsed] = useState(false);

  // ... (các hàm khác giữ nguyên) ...

  const handleLogoutClick = () => {
    // Kiểm tra xem có BẤT KỲ dự án nào chưa lưu không
    const hasAnyDrafts = Object.keys(localStorage).some(key => key.startsWith('turtle_draft_'));

    if (hasAnyDrafts) {
      const confirmLogout = window.confirm('Rùa thấy bé vẫn còn một số dự án chưa lưu lên Server! Nếu đăng xuất bây giờ, các bản nháp đó sẽ bị xóa hết. Bé có chắc muốn thoát không? 🐢🗑️');
      if (!confirmLogout) return;
    }

    // Luôn xóa sạch Playground và các bản nháp khi đăng xuất
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('turtle_draft') || key.startsWith('turtle_playground')) {
        localStorage.removeItem(key);
      }
    });

    logout();
    navigate('/auth');
  };

  useEffect(() => {
    setExpandedMenu(user ? 'Hành trình của bé' : 'Playground');
    setActiveMenu(user ? 'Hành trình của bé' : 'Playground');
  }, [user]);

  useEffect(() => {
    if (activeMenu === 'Playground') {
      onPlaygroundClick();
    }
  }, [activeMenu]);

  const handleDelete = async (e, id, title) => {
    e.stopPropagation();
    const confirmDelete = window.confirm(`Bé có chắc muốn xóa dự án "${title}" không? 🐢🗑️`);
    if (confirmDelete) {
      try {
        await lessonApi.remove(id);
        fetchProjects(true);
      } catch (err) {
        alert('Có lỗi xảy ra khi xóa bài! ❌');
      }
    }
  };

  const menuItems = user ? [
    { icon: '📜', label: 'Hành trình của bé' },
    { icon: '📁', label: 'Dự án của tôi' },
    { icon: '🎨', label: 'Playground' },
    { icon: '📖', label: 'Wiki', path: '/wiki' },
  ] : [
    { icon: '🎨', label: 'Playground' },
    { icon: '📖', label: 'Wiki', path: '/wiki' },
  ];

  const handleMenuClick = (item) => {
    if (item.path) {
      navigate(item.path);
    } else {
      setActiveMenu(item.label);
      if (expandedMenu === item.label) {
        setExpandedMenu(null);
      } else {
        setExpandedMenu(item.label);
      }
    }
  };

  const getAvatarUrl = () => {
    if (!user?.avatar) return null;
    if (user.avatar.startsWith('http')) return user.avatar;
    return `http://127.0.0.1:8000${user.avatar}`;
  };

  return (
    <div className={`h-screen bg-white border-r-[3px] border-[var(--border)] flex flex-col p-4 shrink-0 transition-all duration-300 relative ${isCollapsed ? 'w-24' : 'w-72'}`}>
      {/* Nút Thu gọn/Mở rộng */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-6 -right-4 w-8 h-8 bg-white border-[3px] border-[var(--border)] rounded-full flex items-center justify-center cursor-pointer shadow-[2px_2px_0px_#1a1a1a] z-50 hover:bg-[var(--pink)] transition-colors"
      >
        <span className={`text-xs font-black transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}>◀</span>
      </button>

      {/* Logo */}
      <div className={`flex items-center gap-3 mb-10 shrink-0 cursor-pointer overflow-hidden ${isCollapsed ? 'justify-center px-0' : 'px-2'}`} onClick={() => navigate('/')}>
        <span className="text-3xl shrink-0">🐢</span>
        {!isCollapsed && <span className="font-black text-xl tracking-tight uppercase whitespace-nowrap">Turtle Code</span>}
      </div>

      {/* Menu & Project List */}
      <nav className={`flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-1 overflow-x-hidden ${isCollapsed ? 'items-center' : ''}`}>
        {menuItems.map((item) => (
          <div key={item.label} className={isCollapsed ? 'flex justify-center' : ''}>
            <div className={`relative group ${isCollapsed ? 'w-fit' : 'w-full'}`}>
              <button
                onClick={() => {
                  if (isCollapsed) setIsCollapsed(false);
                  handleMenuClick(item);
                }}
                className={`flex items-center gap-3 py-3.5 rounded-xl font-black text-base sm:text-lg whitespace-nowrap transition-all border-[2.5px] overflow-hidden ${
                  isCollapsed ? 'justify-center px-3.5 w-[52px]' : 'px-4 w-full'
                } ${activeMenu === item.label
                  ? 'bg-[var(--orange)] border-[var(--border)] shadow-[4px_4px_0px_#1a1a1a] translate-x-[-2px] translate-y-[-2px]'
                  : 'bg-transparent border-transparent hover:bg-[var(--bg)]'
                  }`}
                title={isCollapsed ? item.label : ''}
              >
                <span className="text-xl shrink-0">{item.icon}</span>
                {!isCollapsed && <span>{item.label}</span>}
              </button>

              {user && item.label === 'Dự án của tôi' && activeMenu === 'Dự án của tôi' && (
                <button
                  onClick={(e) => { e.stopPropagation(); onNewProject(); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border-2 border-[var(--border)] rounded-md flex items-center justify-center font-black text-xs shadow-[2px_2px_0px_#000] hover:bg-[var(--green)] transition-all active:shadow-none active:translate-y-[-45%] opacity-0 group-hover:opacity-100"
                  title="Tạo dự án mới"
                >
                  +
                </button>
              )}

              {item.label === 'Playground' && activeMenu === 'Playground' && (
                <button
                  onClick={(e) => { e.stopPropagation(); onResetPlayground(); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border-2 border-red-500 rounded-md flex items-center justify-center font-black text-[10px] text-red-500 shadow-[2px_2px_0px_#ef4444] hover:bg-red-500 hover:text-white transition-all active:shadow-none active:translate-y-[-45%] opacity-0 group-hover:opacity-100"
                  title="Xóa nháp và làm lại từ đầu"
                >
                  ✕
                </button>
              )}
            </div>

            {!isCollapsed && item.label === 'Playground' && expandedMenu === 'Playground' && (
              <div className="mt-2 ml-4 space-y-2 border-l-2 border-[var(--border)] pl-4 py-2 animate-in slide-in-from-top-2">
                <div className="text-xs font-black text-gray-400 uppercase mb-2">Bài vẽ mẫu của hệ thống</div>

                <button
                  onClick={() => onPlaygroundClick('default', null, 'Playground 🎨')}
                  className="w-full text-left text-sm sm:text-base font-extrabold py-2.5 px-3.5 rounded-lg hover:bg-[var(--green)] border-2 border-transparent hover:border-[var(--border)] transition-all truncate"
                  title="Playground 🎨"
                >
                  🎨 Playground
                </button>

                {SAMPLE_PROGRAMS.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => onPlaygroundClick(`sample_${idx}`, sample.code, sample.title)}
                    className="w-full text-left text-sm sm:text-base font-extrabold py-2.5 px-3.5 rounded-lg hover:bg-[var(--green)] border-2 border-transparent hover:border-[var(--border)] transition-all truncate"
                    title={sample.title}
                  >
                    🎨 {sample.title}
                  </button>
                ))}
              </div>
            )}

            {!isCollapsed && user && item.label === 'Hành trình của bé' && expandedMenu === 'Hành trình của bé' && (
              <div className="mt-2 ml-4 space-y-2 border-l-2 border-[var(--border)] pl-4 py-2 animate-in slide-in-from-top-2">
                <div className="text-xs font-black text-gray-400 uppercase mb-2">10 Chặng vẽ ma thuật</div>
                {Array.from({ length: 10 }, (_, i) => {
                  const stageNum = i + 1;
                  const isCompleted = completedStages.includes(stageNum);
                  const isLocked = stageNum > 1 && !completedStages.includes(stageNum - 1);
                  const isActive = activeStage === stageNum;
                  
                  return (
                    <button
                      key={stageNum}
                      disabled={isLocked}
                      onClick={() => onStageClick(stageNum)}
                      className={`w-full text-left text-sm sm:text-base font-extrabold py-2.5 px-3.5 rounded-lg border-2 transition-all flex items-center justify-between ${
                        isActive
                          ? 'bg-[var(--yellow)] border-[var(--border)] shadow-[2px_2px_0px_#1a1a1a] translate-x-[-1px] translate-y-[-1px]'
                          : isLocked
                          ? 'bg-gray-100 border-transparent text-gray-400 cursor-not-allowed opacity-60'
                          : 'hover:bg-[var(--green)] border-transparent hover:border-[var(--border)]'
                      }`}
                      title={STAGE_TITLES[stageNum]}
                    >
                      <span className="truncate">
                        {stageNum}. {STAGE_TITLES[stageNum]}
                      </span>
                      <span className="shrink-0 ml-1">
                        {isLocked ? '🔒' : isCompleted ? '✅' : '▶️'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {!isCollapsed && user && item.label === 'Dự án của tôi' && expandedMenu === 'Dự án của tôi' && (
              <div className="mt-2 ml-4 space-y-2 border-l-2 border-[var(--border)] pl-4 py-2 animate-in slide-in-from-top-2">
                {projects.length > 0 ? (
                  projects.map((p) => (
                    <div key={p.id} className="relative group/item">
                      <button
                        onClick={() => onLoadProject(p)}
                        className="w-full text-left text-sm sm:text-base font-extrabold py-2.5 px-3.5 pr-8 rounded-lg hover:bg-[var(--yellow)] border-2 border-transparent hover:border-[var(--border)] transition-all truncate"
                        title={p.title}
                      >
                        📄 {p.title}
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, p.id, p.title)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs font-bold text-gray-400 italic">Chưa có dự án nào...</p>
                )}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* User Info & Logout */}
      <div className="mt-auto pt-4 border-t-2 border-[var(--bg)] shrink-0 overflow-hidden">
        <div className={`flex items-center gap-3 p-2 bg-[var(--bg)] rounded-xl border-[2px] border-[var(--border)] mb-3 relative group overflow-hidden ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 bg-white rounded-full border-2 border-[var(--border)] flex items-center justify-center overflow-hidden shrink-0 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
            {user?.avatar ? (
              <img src={getAvatarUrl()} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl">{user ? '👤' : '🐢'}</span>
            )}
          </div>
          
          {!isCollapsed && (
            <div className="overflow-hidden flex-1">
              <p className="text-[10px] font-black text-gray-400 uppercase leading-none">{user ? (selectedTitle || 'Hiệp Sĩ Tập Sự ⚔️') : 'Chào bé'}</p>
              <p className="font-black text-sm truncate uppercase tracking-tighter">
                {user?.first_name || user?.username || 'Hiệp sĩ Rùa'}
              </p>
            </div>
          )}

          {!isCollapsed && user && (
            <button
              onClick={() => navigate('/profile')}
              className="w-7 h-7 bg-white border-2 border-[var(--border)] rounded-md flex items-center justify-center text-xs shadow-[2px_2px_0px_#000] hover:bg-[var(--yellow)] transition-all active:shadow-none active:translate-y-[1px] shrink-0"
              title="Cài đặt tài khoản"
            >
              ⚙️
            </button>
          )}
        </div>

        {user ? (
          <button
            onClick={handleLogoutClick}
            className={`w-full py-2 bg-[var(--pink)] border-[2px] border-[var(--border)] rounded-lg font-black text-sm shadow-[3px_3px_0px_#1a1a1a] hover:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-2 ${isCollapsed ? 'px-0' : ''}`}
            title="Đăng xuất"
          >
            {isCollapsed ? '🚪' : 'ĐĂNG XUẤT 🚪'}
          </button>
        ) : (
          <button
            onClick={() => navigate('/auth')}
            className={`w-full py-2 bg-[var(--green)] border-[2px] border-[var(--border)] rounded-lg font-black text-sm shadow-[3px_3px_0px_#1a1a1a] hover:translate-y-[1px] active:shadow-none transition-all uppercase tracking-widest flex items-center justify-center gap-2 ${isCollapsed ? 'px-0' : ''}`}
            title="Đăng nhập"
          >
            {isCollapsed ? '🔐' : 'ĐĂNG NHẬP 🔐'}
          </button>
        )}
      </div>
    </div>
  );
}
