import { useAuth } from '../../hooks/useAuth';

export default function CommandPalette({ commands, onCommandClick, onAddClick, onEditClick }) {
  const { user } = useAuth();

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-2 border-b-2 border-[var(--border)] bg-[var(--bg)] flex flex-col items-center gap-1">
        <h3 className="font-black text-[8px] uppercase tracking-tighter text-gray-400">Lệnh</h3>
        
        {/* Chỉ hiện nút thêm nếu đã đăng nhập */}
        {user && (
          <button 
            onClick={onAddClick} 
            className="w-8 h-8 bg-white border-2 border-[var(--border)] rounded-full font-black text-lg flex items-center justify-center hover:bg-[var(--yellow)] transition-colors shadow-[2px_2px_0px_#000] active:translate-y-[1px] active:shadow-none"
          >
            +
          </button>
        )}
      </div>
      
      <div className="flex-1 p-3 flex flex-col items-center gap-6 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {commands.map((cmd, index) => (
          <div key={index} className="flex flex-col items-center gap-1 group">
            <div className="relative shrink-0">
              <button
                onClick={() => onCommandClick(cmd.code)}
                onContextMenu={(e) => { 
                  if (user) {
                    e.preventDefault(); 
                    onEditClick(index); 
                  }
                }}
                style={{ backgroundColor: cmd.color }}
                className="w-12 h-12 rounded-full border-[3px] border-[var(--border)] shadow-[3px_3px_0px_#1a1a1a] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_#1a1a1a] active:translate-y-[1px] active:shadow-none transition-all relative"
              >
              </button>

              {/* Chỉ hiện nút sửa nếu đã đăng nhập */}
              {user && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onEditClick(index); }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-white border-2 border-[var(--border)] rounded-full text-[8px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
                >
                  ✏️
                </button>
              )}
            </div>
            <span className="text-[8px] font-black text-center leading-tight uppercase truncate w-20 text-gray-500">
              {cmd.label}
            </span>
          </div>
        ))}
        
        <div className="h-4 w-full"></div>
      </div>
    </div>
  );
}
