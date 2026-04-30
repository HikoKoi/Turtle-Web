import { useState, useEffect } from 'react';
import Sidebar from '../../components/Workspace/Sidebar';
import Editor from '../../components/Workspace/Editor';
import CommandPalette from '../../components/Workspace/CommandPalette';
import ChatbotBubble from '../../components/Workspace/ChatbotBubble';
import CommandModal from '../../components/Workspace/CommandModal';
import Preview from '../../components/Workspace/Preview';
import lessonApi from '../../api/lessonApi';
import authApi from '../../api/authApi';
import { useAuth } from '../../hooks/useAuth';
import { useProjects } from '../../contexts/ProjectContext';

const DEFAULT_COMMANDS = [
  { label: 'Tiến lên', color: '#88e1bb', code: 't.forward(100)' },
  { label: 'Xoay phải', color: '#ffbd2e', code: 't.right(90)' },
  { label: 'Xoay trái', color: '#ff5f56', code: 't.left(90)' },
  { label: 'Hình vuông', color: '#8ed1f7', code: 'for i in range(4):\n    t.forward(100)\n    t.right(90)' },
  { label: 'Hình tròn', color: '#d18cf7', code: 't.circle(50)' },
  { label: 'Về nhà', color: '#ffffff', code: 't.home()' },
];

export default function WorkspacePage() {
  const { user, setUser } = useAuth();
  const { fetchProjects } = useProjects();
  
  const [isPlayground, setIsPlayground] = useState(!user);
  const [projectId, setProjectId] = useState(null);
  const [projectTitle, setProjectTitle] = useState(user ? 'Dự án sáng tạo của tớ' : 'Playground 🎨');
  
  const PLAYGROUND_TEMPLATE = '# Đây là khu vực vẽ nháp - Tốc độ tối đa\nimport turtle\n\nt = turtle.Turtle()\nt.speed(0) # Chạy siêu nhanh\nt.color("orange")\n\n';
  const playgroundKey = `turtle_playground_${user?.username || 'guest'}`;
  const commandsKey = `turtle_commands_${user?.username || 'guest'}`;

  // --- LOGIC LOAD NÚT LỆNH ---
  const [commands, setCommands] = useState(() => {
    if (user?.custom_commands && user.custom_commands.length > 0) {
      return user.custom_commands;
    }
    const localCmds = localStorage.getItem(commandsKey);
    if (localCmds) {
      try { return JSON.parse(localCmds); } catch (e) { return DEFAULT_COMMANDS; }
    }
    return DEFAULT_COMMANDS;
  });

  const [code, setCode] = useState(() => {
    if (!user) {
        return localStorage.getItem(playgroundKey) || PLAYGROUND_TEMPLATE;
    }
    return '# Nhập code Python của bạn ở đây\nimport turtle\n\nt = turtle.Turtle()\nt.shape("turtle")\nt.speed(3)\nt.color("green")\n\n';
  });

  const [runTrigger, setRunTrigger] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(''); 
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  // --- BẢO HIỂM PHÉP THUẬT (AUTO-SAVE & EXIT WARNING) ---
  const [lastSavedCode, setLastSavedCode] = useState(code);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (code !== lastSavedCode) {
      setIsDirty(true);
      if (!isPlayground && user) {
        const draftKey = `turtle_draft_${user.username}_${projectId || 'new'}`;
        localStorage.setItem(draftKey, code);
      }
    } else {
      setIsDirty(false);
    }
  }, [code, lastSavedCode, isPlayground, user, projectId]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      const hasAnyDrafts = Object.keys(localStorage).some(key => key.startsWith('turtle_draft_'));
      if (hasAnyDrafts) {
        e.preventDefault();
        e.returnValue = 'Bé vẫn còn dự án chưa lưu, nếu thoát bây giờ bản nháp sẽ bị xóa sạch! 🐢❓';
      }
    };

    const handleUnload = () => {
        // Luôn xóa sạch Playground và các bản nháp khi thực sự thoát/đóng trình duyệt
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('turtle_draft') || key.startsWith('turtle_playground')) {
              localStorage.removeItem(key);
            }
        });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleUnload);
    
    return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        window.removeEventListener('unload', handleUnload);
    };
  }, []);

  // Lưu code playground cục bộ
  useEffect(() => {
    if (isPlayground) {
      localStorage.setItem(playgroundKey, code);
    }
  }, [code, isPlayground]);

  // --- LOGIC LƯU NÚT LỆNH TOÀN CỤC ---
  const syncCommands = async (newCommands) => {
    setCommands(newCommands);
    localStorage.setItem(commandsKey, JSON.stringify(newCommands));
    if (user) {
      try {
        const { data } = await authApi.updateProfile({ custom_commands: newCommands });
        setUser({ ...user, custom_commands: data.data.custom_commands });
      } catch (err) {
        console.error('Lỗi khi đồng bộ nút lệnh:', err);
      }
    }
  };

  const handleCommandClick = (commandCode) => {
    setCode((prev) => prev.trim() + '\n\n' + commandCode + '\n');
  };

  const handleSave = async () => {
    if (isPlayground) return; 
    setIsSaving(true);
    setSaveStatus('');
    try {
      const payload = { title: projectTitle, raw_code: code };
      if (projectId) {
        await lessonApi.update(projectId, payload);
      } else {
        const { data } = await lessonApi.create(payload);
        setProjectId(data.id);
      }
      await fetchProjects(true);
      setLastSavedCode(code);
      setIsDirty(false);
      setSaveStatus('success');
      if (user) {
        const draftKey = `turtle_draft_${user.username}_${projectId || 'new'}`;
        localStorage.removeItem(draftKey);
      }
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (err) {
      console.error('Lỗi khi lưu:', err);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadProject = (projectData) => {
    setIsPlayground(false);
    setProjectId(projectData.id);
    setProjectTitle(projectData.title);
    
    const draftKey = `turtle_draft_${user.username}_${projectData.id}`;
    const draft = localStorage.getItem(draftKey);
    
    if (draft && draft !== projectData.code_display) {
      setCode(draft);
      setLastSavedCode(projectData.code_display);
      setIsDirty(true);
    } else {
      setCode(projectData.code_display || '');
      setLastSavedCode(projectData.code_display || '');
      setIsDirty(false);
    }
    setRunTrigger(0);
  };

  const handleNewProject = () => {
    setIsPlayground(false);
    setProjectId(null);
    setProjectTitle('Dự án sáng tạo mới');
    const defaultCode = '# Nhập code Python của bạn ở đây\nimport turtle\n\nt = turtle.Turtle()\nt.shape("turtle")\nt.speed(3)\nt.color("green")\n\n';
    setCode(defaultCode);
    setLastSavedCode(defaultCode);
    setIsDirty(false);
    setRunTrigger(0);
    setSaveStatus('');
  };

  const handlePlaygroundMode = () => {
    setIsPlayground(true);
    setProjectId(null);
    setProjectTitle('Playground 🎨');
    const savedCode = localStorage.getItem(playgroundKey);
    setCode(savedCode || PLAYGROUND_TEMPLATE);
    setLastSavedCode(savedCode || PLAYGROUND_TEMPLATE);
    setIsDirty(false);
    setRunTrigger(0);
    setSaveStatus('');
  };

  const handleResetPlayground = () => {
    if (window.confirm('Xóa hết nháp để làm lại từ đầu nhé Hiệp sĩ? 🐢🗑️')) {
      setCode(PLAYGROUND_TEMPLATE);
      localStorage.setItem(playgroundKey, PLAYGROUND_TEMPLATE);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${projectTitle || 'creative_turtle'}.py`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setCode(event.target.result);
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  const handleSaveCommand = (data) => {
    let newCmds = [];
    if (editingIndex !== null) {
      newCmds = [...commands];
      newCmds[editingIndex] = data;
    } else {
      newCmds = [...commands, data];
    }
    syncCommands(newCmds);
    setIsModalOpen(false);
  };

  const handleDeleteCommand = (index) => {
    const newCmds = commands.filter((_, i) => i !== index);
    syncCommands(newCmds);
    setIsModalOpen(false);
  };

  const openAddModal = () => {
    setEditingIndex(null);
    setIsModalOpen(true);
  };

  const openEditModal = (index) => {
    setEditingIndex(index);
    setIsModalOpen(true);
  };

  return (
    <div className="flex h-screen bg-[var(--bg)] overflow-hidden font-nunito">
      <Sidebar 
        onLoadProject={handleLoadProject} 
        onNewProject={handleNewProject} 
        onPlaygroundClick={handlePlaygroundMode} 
        onResetPlayground={handleResetPlayground}
        hasUnsavedChanges={isDirty}
      />

      <main className="flex-1 p-6 flex flex-col gap-4 overflow-hidden">
        <div className="flex justify-between items-center bg-white p-4 neo-card h-16 shrink-0 relative">
          <div className="flex items-center gap-4 flex-1">
             <div className="bg-[var(--yellow)] px-3 py-1 border-2 border-[var(--border)] rounded-md font-black text-[10px] shadow-[2px_2px_0px_#1a1a1a]">
                {isPlayground ? 'BẢN NHÁP ✏️' : 'DỰ ÁN 🚀'}
             </div>
             <input 
                type="text" 
                value={projectTitle}
                disabled={isPlayground}
                onChange={(e) => setProjectTitle(e.target.value)}
                className={`font-black text-lg bg-transparent border-none outline-none focus:ring-2 focus:ring-[var(--cyan)] rounded px-2 w-full max-w-[400px] ${isPlayground ? 'text-gray-400' : ''}`}
             />
          </div>

          <div className="flex gap-2 flex-1 justify-end items-center">
             {!isPlayground && (
               <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`neo-btn-secondary py-1 text-xs px-6 transition-all ${
                    saveStatus === 'success' ? 'bg-[var(--green)]' : 
                    saveStatus === 'error' ? 'bg-[var(--pink)]' : 
                    isDirty ? 'bg-[#ff5f56] text-white ring-2 ring-red-400 shadow-[0_0_15px_rgba(255,95,86,0.6)] animate-pulse border-red-700' : 'bg-[#fcece2]'
                  }`}
               >
                  {isSaving ? 'ĐANG LƯU...' : saveStatus === 'success' ? 'ĐÃ LƯU ✅' : isDirty ? 'LƯU NGAY! 💾' : 'LƯU 💾'}
               </button>
             )}

             <button 
                onClick={handleDownload}
                className="neo-btn-secondary py-1 px-3 bg-white flex items-center justify-center"
                title="Tải code về máy"
             >
                ⬇️
             </button>

             <input type="file" id="upload-py" className="hidden" accept=".py,.txt" onChange={handleUpload} />
             <label htmlFor="upload-py" className="neo-btn-secondary py-1 px-3 bg-white flex items-center justify-center cursor-pointer" title="Tải code lên">
                ⬆️
             </label>

             <button 
                onClick={() => setRunTrigger(prev => prev + 1)} 
                className="neo-btn-primary py-1 text-xs px-8 bg-[var(--green)] active:translate-y-1 transition-all"
             >
                CHẠY RÙA 🐢 ▶️
             </button>
          </div>
        </div>

        <div className="flex-1 flex gap-4 overflow-hidden">
          <div className="flex-1 min-w-0 h-full flex flex-col">
             <div className="relative flex-1 flex flex-col">
                <Editor code={code} onChange={setCode} />
             </div>
          </div>

          <div className="w-[100px] h-full neo-card overflow-hidden shrink-0">
             <CommandPalette 
               commands={commands} 
               onCommandClick={handleCommandClick}
               onAddClick={openAddModal}
               onEditClick={openEditModal}
             />
          </div>

          <div className="flex-[1.2] h-full flex flex-col min-w-0">
             <div className="flex-1 neo-card bg-white relative overflow-hidden flex flex-col shadow-[6px_6px_0px_#1a1a1a]">
                <div className="p-2 border-b-2 border-[var(--border)] bg-[var(--bg)] font-black text-[10px] text-center uppercase tracking-widest">
                    Sân chơi của Rùa 🎨
                </div>
                <Preview code={code} runTrigger={runTrigger} />
             </div>
          </div>
        </div>
      </main>

      {user && <ChatbotBubble />}
      <CommandModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveCommand}
        onDelete={handleDeleteCommand}
        initialData={editingIndex !== null ? {...commands[editingIndex], index: editingIndex} : null}
      />
    </div>
  );
}
