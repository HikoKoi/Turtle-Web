import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useProjects } from '../../contexts/ProjectContext';
import { useNavigate } from 'react-router-dom';
import lessonApi from '../../api/lessonApi';

export default function Sidebar({ onLoadProject, onNewProject, onPlaygroundClick, onResetPlayground, hasUnsavedChanges }) {
  const { user, logout } = useAuth();
  const { projects, fetchProjects } = useProjects();
  const navigate = useNavigate();
  
  const [activeMenu, setActiveMenu] = useState(user ? 'Dự án của tôi' : 'Playground');
  const [showProjects, setShowProjects] = useState(true);

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
    if (activeMenu === 'Dự án của tôi') {
      setShowProjects(true);
    } else {
      setShowProjects(false);
      if (activeMenu === 'Playground') {
        onPlaygroundClick();
      }
    }
  }, [activeMenu, user]);

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
    }
  };

  const getAvatarUrl = () => {
    if (!user?.avatar) return null;
    if (user.avatar.startsWith('http')) return user.avatar;
    return `http://127.0.0.1:8000${user.avatar}`; 
  };

  return (
    <div className="w-64 h-screen bg-white border-r-[3px] border-[var(--border)] flex flex-col p-4 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10 px-2 shrink-0 cursor-pointer" onClick={() => navigate('/')}>
        <span className="text-3xl">🐢</span>
        <span className="font-black text-xl tracking-tight uppercase">Turtle Code</span>
      </div>

      {/* Menu & Project List */}
      <nav className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-1">
        {menuItems.map((item) => (
          <div key={item.label}>
            <div className="relative group">
              <button
                onClick={() => handleMenuClick(item)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-black text-sm transition-all border-[2.5px] ${
                  activeMenu === item.label
                    ? 'bg-[var(--orange)] border-[var(--border)] shadow-[4px_4px_0px_#1a1a1a] translate-x-[-2px] translate-y-[-2px]'
                    : 'bg-transparent border-transparent hover:bg-[var(--bg)]'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                {item.label}
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
                  title="Reset Playground"
                >
                  ✕
                </button>
              )}
            </div>

            {user && item.label === 'Dự án của tôi' && showProjects && (
              <div className="mt-2 ml-4 space-y-2 border-l-2 border-[var(--border)] pl-4 py-2 animate-in slide-in-from-top-2">
                {projects.length > 0 ? (
                  projects.map((p) => (
                    <div key={p.id} className="relative group/item">
                      <button
                        onClick={() => onLoadProject(p)}
                        className="w-full text-left text-[11px] font-bold py-2 px-3 pr-8 rounded-lg hover:bg-[var(--yellow)] border-2 border-transparent hover:border-[var(--border)] transition-all truncate"
                        title={p.title}
                      >
                        📄 {p.title}
                      </button>
                      <button 
                        onClick={(e) => handleDelete(e, p.id, p.title)}
                        className="absolute right-1 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] font-bold text-gray-400 italic">Chưa có dự án nào...</p>
                )}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* User Info & Logout */}
      <div className="mt-auto pt-4 border-t-2 border-[var(--bg)] shrink-0">
        <div className="flex items-center gap-3 p-2 bg-[var(--bg)] rounded-xl border-[2px] border-[var(--border)] mb-3 relative group">
          <div className="w-10 h-10 bg-white rounded-full border-2 border-[var(--border)] flex items-center justify-center overflow-hidden shrink-0 shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
            {user?.avatar ? (
              <img src={getAvatarUrl()} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl">{user ? '👤' : '🐢'}</span>
            )}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-[8px] font-black text-gray-400 uppercase leading-none">{user ? 'Hiệp sĩ' : 'Chào bé'}</p>
            <p className="font-black text-xs truncate uppercase tracking-tighter">
              {user?.first_name || user?.username || 'Hiệp sĩ Rùa'}
            </p>
          </div>
          
          {user && (
            <button 
              onClick={() => navigate('/profile')}
              className="w-7 h-7 bg-white border-2 border-[var(--border)] rounded-md flex items-center justify-center text-xs shadow-[2px_2px_0px_#000] hover:bg-[var(--yellow)] transition-all active:shadow-none active:translate-y-[1px]"
              title="Cài đặt tài khoản"
            >
              ⚙️
            </button>
          )}
        </div>

        {user ? (
          <button
            onClick={handleLogoutClick}
            className="w-full py-2 bg-[var(--pink)] border-[2px] border-[var(--border)] rounded-lg font-black text-xs shadow-[3px_3px_0px_#1a1a1a] hover:translate-y-[1px] active:shadow-none transition-all"
          >
            ĐĂNG XUẤT 🚪
          </button>
        ) : (
          <button
            onClick={() => navigate('/auth')}
            className="w-full py-2 bg-[var(--green)] border-[2px] border-[var(--border)] rounded-lg font-black text-xs shadow-[3px_3px_0px_#1a1a1a] hover:translate-y-[1px] active:shadow-none transition-all uppercase tracking-widest"
          >
            Đăng nhập 🔑
          </button>
        )}
      </div>
    </div>
  );
}
