import { useState, useEffect } from 'react';
import Sidebar, { STAGE_TITLES } from '../../components/Workspace/Sidebar';
import Editor from '../../components/Workspace/Editor';
import CommandPalette from '../../components/Workspace/CommandPalette';
import ChatbotBubble from '../../components/Workspace/ChatbotBubble';
import CommandModal from '../../components/Workspace/CommandModal';
import Preview from '../../components/Workspace/Preview';
import lessonApi from '../../api/lessonApi';
import authApi from '../../api/authApi';
import { useAuth } from '../../hooks/useAuth';
import { useProjects } from '../../contexts/ProjectContext';

const getStageDescription = (stageNumber) => {
  const descs = {
    1: "Vẽ bậc thang đi lên bằng các lệnh cơ bản forward, left(90), right(90).",
    2: "Vẽ tam giác cân/đều viền dày màu xanh lá, tô kín màu vàng bên trong bằng begin_fill và end_fill.",
    3: "Dùng biến số (ví dụ: canh, kich_thuoc) vẽ hình chữ nhật dài gấp đôi rộng.",
    4: "Dùng vòng lặp for vẽ một hình lục giác đều 6 cạnh rực rỡ.",
    5: "Dùng penup, pendown vẽ 2 hình tròn nằm ở 2 vị trí khác nhau không chạm nhau.",
    6: "Dùng câu lệnh rẽ nhánh if/else: nếu xcor() > 100 đổi màu đỏ, ngược lại giữ màu xanh dương.",
    7: "Dùng vòng lặp while vẽ đường xoắn ốc tăng dần nét vẽ và tự ngắt bằng break khi chieu_dai > 150.",
    8: "Tạo danh sách chứa 4 màu và dùng random.choice() kết hợp lặp vẽ hoa tròn nhiều màu lồng nhau.",
    9: "Tự định nghĩa hàm không tham số ve_bong_hoa() hoặc ve_ngoi_sao() và di chuyển vẽ ở 2 vị trí khác nhau.",
    10: "Tự tạo hàm ve_bong_bong(x, y, ban_kinh, mau) có tham số vẽ bong bóng tròn màu sắc. Gọi hàm vẽ 3 bong bóng to nhỏ khác nhau."
  };
  return descs[stageNumber] || "";
};

const STAGE_TEMPLATES = {
  1: `# ----------------------------------------------------
# 📜 BÍ KÍP CHẶNG 1: LỆNH DI CHUYỂN CƠ BẢN
# ----------------------------------------------------
# Rùa có thể đi tới bằng lệnh: t.forward(số_bước)
# Rùa có thể xoay trái bằng lệnh: t.left(số_độ)
# Rùa có thể xoay phải bằng lệnh: t.right(số_độ)
#
# Ví dụ: Để Rùa đi thẳng 100 bước rồi rẽ phải góc vuông (90 độ):
# t.forward(100)
# t.right(90)
#
# 🎯 THỬ THÁCH CỦA BÉ:
# Đề bài: Vẽ bậc thang đi lên bằng các lệnh cơ bản forward, left(90), right(90).
# ----------------------------------------------------

import turtle

t = turtle.Turtle()
t.shape("turtle")
t.speed(3)
t.color("blue")
t.pensize(3)

# Bé hãy viết phép thuật vẽ bậc thang ở dưới này nhé:
`,

  2: `# ----------------------------------------------------
# 📜 BÍ KÍP CHẶNG 2: TÔ MÀU PHÉP THUẬT
# ----------------------------------------------------
# Để tô màu một hình, Rùa cần làm 3 bước:
# 1. Bơm màu vẽ: t.fillcolor("yellow") 
# 2. Đặt bút bắt đầu tô: t.begin_fill()
# 3. Vẽ hình (ví dụ vẽ hình vuông, tam giác...)
# 4. Nhấc bút kết thúc tô: t.end_fill()
#
# 🎯 THỬ THÁCH CỦA BÉ:
# Đề bài: Vẽ tam giác cân/đều viền dày màu xanh lá (pensize >= 5), tô kín màu vàng bên trong.
# ----------------------------------------------------

import turtle

t = turtle.Turtle()
t.shape("turtle")
t.speed(3)

# Đặt nét bút dày và viền màu xanh lá:
t.pensize(5)
t.pencolor("green")

# Bé hãy dùng fillcolor("yellow") và begin_fill(), end_fill() để vẽ tam giác nhé:
`,

  3: `# ----------------------------------------------------
# 📜 BÍ KÍP CHẶNG 3: BIẾN SỐ LÀ CHIẾC HỘP THẦN KỲ
# ----------------------------------------------------
# Thay vì phải gõ số 100 nhiều lần, ta có thể dùng "Biến số".
# Biến số giống như một chiếc hộp đựng giá trị.
#
# Ví dụ:
# chieu_dai = 100        # Tạo chiếc hộp tên là chieu_dai đựng số 100
# t.forward(chieu_dai)   # Rùa sẽ đi tới 100 bước!
#
# Ta cũng có thể làm toán với hộp:
# t.forward(chieu_dai * 2) # Rùa đi tới 200 bước!
#
# 🎯 THỬ THÁCH CỦA BÉ:
# Đề bài: Dùng biến số để vẽ hình chữ nhật có chiều dài gấp đôi chiều rộng.
# ----------------------------------------------------

import turtle

t = turtle.Turtle()
t.shape("turtle")
t.speed(3)
t.color("purple")
t.pensize(3)

# Khởi tạo biến số:
chieu_rong = 50
chieu_dai = chieu_rong * 2

# Bé hãy viết lệnh vẽ dùng chieu_dai và chieu_rong ở đây nhé:
`,

  4: `# ----------------------------------------------------
# 📜 BÍ KÍP CHẶNG 4: VÒNG LẶP FOR (PHÉP LẶP TỰ ĐỘNG)
# ----------------------------------------------------
# Rùa rất lười gõ lệnh lặp đi lặp lại. Ta có vòng lặp FOR!
# 
# Ví dụ vẽ hình vuông (4 cạnh):
# for i in range(4):     # Lặp lại 4 lần
#     t.forward(100)     # Lệnh thụt lề này sẽ chạy 4 lần
#     t.right(90)        # Lệnh thụt lề này cũng chạy 4 lần
#
# Lưu ý: Các lệnh bên trong vòng lặp phải DẤU CÁCH (thụt lề) nhé!
#
# 🎯 THỬ THÁCH CỦA BÉ:
# Đề bài: Dùng vòng lặp for vẽ một hình lục giác đều (6 cạnh). (Gợi ý: rẽ 360/6 = 60 độ)
# ----------------------------------------------------

import turtle

t = turtle.Turtle()
t.shape("turtle")
t.speed(3)
t.color("red")
t.pensize(3)

# Bé hãy viết vòng lặp for ở đây nhé:
`,

  5: `# ----------------------------------------------------
# 📜 BÍ KÍP CHẶNG 5: NHẤC BÚT VÀ DỊCH CHUYỂN TỨC THỜI
# ----------------------------------------------------
# Rùa có khả năng bay lên không trung để di chuyển mà không để lại vết mực!
#
# 1. Nhấc bút lên: t.penup()
# 2. Bay đến tọa độ x, y: t.goto(x, y)
# 3. Đặt bút xuống vẽ tiếp: t.pendown()
#
# Ví dụ:
# t.penup()
# t.goto(100, 100)
# t.pendown()
# t.circle(50)  # Vẽ hình tròn
#
# 🎯 THỬ THÁCH CỦA BÉ:
# Đề bài: Vẽ 2 hình tròn (hoặc vuông) nằm ở 2 vị trí khác nhau mà viền không chạm nhau.
# ----------------------------------------------------

import turtle

t = turtle.Turtle()
t.shape("turtle")
t.speed(3)
t.color("orange")
t.pensize(3)

# Hình thứ nhất:
t.circle(40)

# Bé hãy dùng penup(), goto(), pendown() để di chuyển và vẽ hình thứ 2 nhé:
`,

  6: `# ----------------------------------------------------
# 📜 BÍ KÍP CHẶNG 6: CÂU LỆNH ĐIỀU KIỆN (IF / ELSE)
# ----------------------------------------------------
# Cấu trúc "Nếu ... thì ..., ngược lại thì ..."
# Rùa có thể xem tọa độ X của mình bằng lệnh: t.xcor()
# 
# Ví dụ:
# vi_tri = t.xcor()
# if vi_tri > 50:
#     t.color("red")     # Nhớ thụt lề nha
# else:
#     t.color("green")   # Nhớ thụt lề nha
#
# 🎯 THỬ THÁCH CỦA BÉ:
# Đề bài: Viết lệnh if/else: nếu t.xcor() > 100 thì Rùa đổi nét bút màu đỏ (red), ngược lại màu xanh dương (blue).
# ----------------------------------------------------

import turtle

t = turtle.Turtle()
t.shape("turtle")
t.speed(3)
t.pensize(4)

# Cho rùa chạy sang phải một chút để tạo tọa độ
t.forward(150)

# Kiểm tra tọa độ của Rùa:
toa_do_x = t.xcor()

# Bé hãy viết lệnh if/else ở đây để đổi màu theo toa_do_x nhé:
`,

  7: `# ----------------------------------------------------
# 📜 BÍ KÍP CHẶNG 7: VÒNG LẶP WHILE VÀ NÚT DỪNG BREAK
# ----------------------------------------------------
# Vòng lặp WHILE là vòng lặp vô tận, trừ khi có lệnh dừng BREAK!
#
# Ví dụ:
# buoc = 10
# while True:              # Cứ lặp mãi mãi
#     t.forward(buoc)
#     t.right(90)
#     buoc = buoc + 10     # Mỗi vòng bước tăng lên 10
#     if buoc > 100:       # Nếu bước quá lớn...
#         break            # ...Thì dừng vòng lặp ngay!
#
# 🎯 THỬ THÁCH CỦA BÉ:
# Đề bài: Dùng vòng lặp while vẽ đường xoắn ốc tăng dần nét vẽ và ngắt vòng lặp bằng break khi nét quá lớn.
# ----------------------------------------------------

import turtle

t = turtle.Turtle()
t.shape("turtle")
t.speed(0)
t.color("magenta")
t.pensize(2)

chieu_dai = 10

# Bé hãy viết vòng lặp while True và dùng lệnh break nhé:
`,

  8: `# ----------------------------------------------------
# 📜 BÍ KÍP CHẶNG 8: DANH SÁCH (LIST) VÀ MÀU SẮC NGẪU NHIÊN
# ----------------------------------------------------
# Danh sách là một chiếc hộp lớn chứa được nhiều món đồ bên trong.
# Ví dụ hộp màu:
# hop_mau = ["red", "blue", "yellow", "green"]
#
# Để Rùa bốc bừa một màu trong hộp, ta cần dùng phép thuật random:
# import random
# mau_ngau_nhien = random.choice(hop_mau)
# t.color(mau_ngau_nhien)
#
# 🎯 THỬ THÁCH CỦA BÉ:
# Đề bài: Tạo danh sách chứa 4 màu và dùng random.choice() kết hợp lặp vẽ bông hoa đa sắc.
# ----------------------------------------------------

import turtle
import random

t = turtle.Turtle()
t.shape("turtle")
t.speed(0)
t.pensize(3)

# Bé hãy tạo hộp màu và dùng vòng lặp for để vẽ nhé:
`,

  9: `# ----------------------------------------------------
# 📜 BÍ KÍP CHẶNG 9: TẠO HÀM MỚI (PHÉP THUẬT CỦA RIÊNG BÉ)
# ----------------------------------------------------
# Ta có thể gom nhiều lệnh thành 1 lệnh mới duy nhất bằng từ khóa "def".
# Đây gọi là định nghĩa Hàm!
#
# Ví dụ tạo lệnh vẽ hình vuông:
# def ve_hinh_vuong():
#     for i in range(4):
#         t.forward(50)
#         t.right(90)
#
# Sau khi định nghĩa, bé chỉ cần gõ "ve_hinh_vuong()" là Rùa tự vẽ!
#
# 🎯 THỬ THÁCH CỦA BÉ:
# Đề bài: Tự định nghĩa hàm ve_bong_hoa() hoặc ve_ngoi_sao() và dùng nhấc bút để triệu hồi hàm vẽ ở 2 vị trí khác nhau.
# ----------------------------------------------------

import turtle

t = turtle.Turtle()
t.shape("turtle")
t.speed(0)
t.color("cyan")
t.pensize(3)

# Bé hãy định nghĩa hàm bằng def ở đây:
`,

  10: `# ----------------------------------------------------
# 📜 BÍ KÍP CHẶNG 10: HÀM CÓ THAM SỐ BIẾN HÓA
# ----------------------------------------------------
# Hàm có thể nhận thêm "nguyên liệu" (tham số) để vẽ linh hoạt hơn!
#
# Ví dụ hàm vẽ hình vuông tùy biến kích thước và màu:
# def ve_hinh_vuong_dac_biet(kich_thuoc, mau_sac):
#     t.color(mau_sac)
#     for i in range(4):
#         t.forward(kich_thuoc)
#         t.right(90)
#
# Khi gọi: ve_hinh_vuong_dac_biet(100, "red") 
#
# 🎯 THỬ THÁCH CỦA BÉ:
# Đề bài: Tự tạo hàm ve_bong_bong(x, y, ban_kinh, mau). Gọi hàm vẽ 3 bong bóng rải rác trên màn hình.
# ----------------------------------------------------

import turtle

t = turtle.Turtle()
t.shape("turtle")
t.speed(0)
t.pensize(4)

# Bé hãy định nghĩa hàm ve_bong_bong có nhận tham số (x, y, ban_kinh, mau) ở đây nhé:
`
};

const getStageTemplate = (stageNumber) => {
  if (STAGE_TEMPLATES[stageNumber]) {
    return STAGE_TEMPLATES[stageNumber];
  }
  return `# Chặng ${stageNumber}: ${STAGE_TITLES[stageNumber] || 'Thử thách'}
# Đề bài: ${getStageDescription(stageNumber)}

import turtle

t = turtle.Turtle()
t.shape("turtle")
t.speed(3)

# Con hãy viết phép thuật vẽ ở dưới này nhé!
`;
};

const DEFAULT_COMMANDS = [
  { label: 'Tiến lên', icon: '⬆️', code: 't.forward(100)' },
  { label: 'Lùi xuống', icon: '⬇️', code: 't.backward(100)' },
  { label: 'Xoay phải', icon: '➡️', code: 't.right(90)' },
  { label: 'Xoay trái', icon: '⬅️', code: 't.left(90)' },
  { label: 'Hình vuông', icon: '🟥', code: 'for i in range(4):\n    t.forward(100)\n    t.right(90)' },
  { label: 'Hình tròn', icon: '🔴', code: 't.circle(50)' },
  { label: 'Về nhà', icon: '🏠', code: 't.home()' },
];

export default function WorkspacePage() {
  const { user, setUser } = useAuth();
  const { fetchProjects } = useProjects();

  const [isPlayground, setIsPlayground] = useState(!user);
  const [playgroundId, setPlaygroundId] = useState('default');
  const [projectId, setProjectId] = useState(null);
  const [projectTitle, setProjectTitle] = useState(user ? 'Đang tải phép thuật...' : 'Playground 🎨');

  // --- TẢI CACHE NHANH TRÁNH FLASH ---
  const getCachedData = (key, defaultVal) => {
    if (!user) return defaultVal;
    try {
      const val = localStorage.getItem(`turtle_${key}_${user.username}`);
      return val ? JSON.parse(val) : defaultVal;
    } catch { return defaultVal; }
  };

  // Trạng thái Lộ trình (Course progression stages)
  const [activeStage, setActiveStage] = useState(null);
  const [completedStages, setCompletedStages] = useState(() => getCachedData('completed_stages', []));
  const [stageCodes, setStageCodes] = useState(() => getCachedData('stage_codes', {}));
  const [unlockedTitles, setUnlockedTitles] = useState(() => getCachedData('unlocked_titles', ["Hiệp Sĩ Tập Sự ⚔️"]));
  const [selectedTitle, setSelectedTitle] = useState(() => {
    if (!user) return "Hiệp Sĩ Tập Sự ⚔️";
    return localStorage.getItem(`turtle_selected_title_${user.username}`) || "Hiệp Sĩ Tập Sự ⚔️";
  });

  // Trạng thái Chấm điểm AI
  const [isGrading, setIsGrading] = useState(false);
  const [graderResult, setGraderResult] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const PLAYGROUND_TEMPLATE = '# Đây là khu vực vẽ nháp - Tốc độ tối đa\nimport turtle\n\nt = turtle.Turtle()\nt.speed(0) # Chạy siêu nhanh\nt.color("orange")\n\n';
  const getPlaygroundKey = (id) => `turtle_playground_${id}_${user?.username || 'guest'}`;
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
      return localStorage.getItem(getPlaygroundKey('default')) || PLAYGROUND_TEMPLATE;
    }
    return '# Nhập code Python của bạn ở đây\nimport turtle\n\nt = turtle.Turtle()\nt.shape("turtle")\nt.speed(3)\nt.color("green")\n\n';
  });

  const [runTrigger, setRunTrigger] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [runtimeError, setRuntimeError] = useState({ msg: null, time: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  // --- BẢO HIỂM PHÉP THUẬT (AUTO-SAVE & EXIT WARNING) ---
  const [lastSavedCode, setLastSavedCode] = useState(code);
  const [isDirty, setIsDirty] = useState(false);

  // Gọi API lấy tiến trình các chặng
  const fetchStageProgress = async () => {
    if (!user) return;
    try {
      const { data } = await lessonApi.getStageProgress();
      const newCompleted = data.completed_stages || [];
      const newCodes = data.stage_codes || {};
      const newUnlocked = data.unlocked_titles || ["Hiệp Sĩ Tập Sự ⚔️"];
      const newSelected = data.selected_title || "Hiệp Sĩ Tập Sự ⚔️";

      setCompletedStages(newCompleted);
      setStageCodes(newCodes);
      setUnlockedTitles(newUnlocked);
      setSelectedTitle(newSelected);

      localStorage.setItem(`turtle_completed_stages_${user.username}`, JSON.stringify(newCompleted));
      localStorage.setItem(`turtle_stage_codes_${user.username}`, JSON.stringify(newCodes));
      localStorage.setItem(`turtle_unlocked_titles_${user.username}`, JSON.stringify(newUnlocked));
      localStorage.setItem(`turtle_selected_title_${user.username}`, newSelected);

      // Mặc định load chặng đầu tiên chưa hoàn thành cho trẻ em
      if (activeStage === null && !isPlayground && !projectId) {
        const nextStage = (newCompleted.length || 0) + 1;
        const targetStage = nextStage <= 10 ? nextStage : 10;
        handleStageClick(targetStage, newCompleted, newCodes);
      }
    } catch (err) {
      console.error('Lỗi tải chặng học:', err);
    }
  };

  useEffect(() => {
    if (user) {
      if (activeStage === null && !isPlayground && !projectId) {
        const nextStage = (completedStages.length || 0) + 1;
        const targetStage = nextStage <= 10 ? nextStage : 10;
        handleStageClick(targetStage, completedStages, stageCodes);
      }
      fetchStageProgress();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (code !== lastSavedCode) {
      setIsDirty(true);
      if (!isPlayground && user) {
        if (activeStage) {
          const stageDraftKey = `turtle_stage_draft_${activeStage}_${user.username}`;
          localStorage.setItem(stageDraftKey, code);
        } else {
          const draftKey = `turtle_draft_${user.username}_${projectId || 'new'}`;
          localStorage.setItem(draftKey, code);
        }
      }
    } else {
      setIsDirty(false);
    }
  }, [code, lastSavedCode, isPlayground, user, projectId, activeStage]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      const hasAnyDrafts = Object.keys(localStorage).some(key => key.startsWith('turtle_draft_') || key.startsWith('turtle_stage_draft_'));
      if (hasAnyDrafts) {
        e.preventDefault();
        e.returnValue = 'Bé vẫn còn dự án chưa lưu, nếu thoát bây giờ bản nháp sẽ bị xóa sạch! 🐢❓';
      }
    };

    const handleUnload = () => {
      // Luôn xóa sạch Playground và các bản nháp khi thực sự thoát/đóng trình duyệt
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('turtle_draft') || key.startsWith('turtle_playground') || key.startsWith('turtle_stage_draft_')) {
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
      localStorage.setItem(getPlaygroundKey(playgroundId), code);
    }
  }, [code, isPlayground, playgroundId, user]);

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
    if (isPlayground || activeStage) return;
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
    setActiveStage(null);
    setProjectTitle(projectData.title);
    setIsDrawerOpen(false);
    setGraderResult(null);

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
    setActiveStage(null);
    setProjectTitle('Dự án sáng tạo mới');
    setIsDrawerOpen(false);
    setGraderResult(null);
    const defaultCode = '# Nhập code Python của bạn ở đây\nimport turtle\n\nt = turtle.Turtle()\nt.shape("turtle")\nt.speed(3)\nt.color("green")\n\n';
    setCode(defaultCode);
    setLastSavedCode(defaultCode);
    setIsDirty(false);
    setRunTrigger(0);
    setSaveStatus('');
  };

  const handlePlaygroundMode = (sampleId = 'default', sampleCode = null, sampleTitle = 'Playground 🎨') => {
    setIsPlayground(true);
    setProjectId(null);
    setActiveStage(null);
    setPlaygroundId(sampleId);
    setProjectTitle(sampleTitle);
    setIsDrawerOpen(false);
    setGraderResult(null);

    const key = getPlaygroundKey(sampleId);
    const savedCode = localStorage.getItem(key);

    if (savedCode) {
      setCode(savedCode);
      setLastSavedCode(savedCode);
    } else {
      const newCode = sampleCode || PLAYGROUND_TEMPLATE;
      setCode(newCode);
      setLastSavedCode(newCode);
    }
    setIsDirty(false);
    setRunTrigger(0);
    setSaveStatus('');
  };

  // Click vào Chặng Học
  const handleStageClick = (stageNum, stagesList = completedStages, codesList = stageCodes) => {
    setIsPlayground(false);
    setProjectId(null);
    setActiveStage(stageNum);
    setProjectTitle(`Chặng ${stageNum}: ${STAGE_TITLES[stageNum]}`);
    setIsDrawerOpen(false);
    setGraderResult(null);

    const stageDraftKey = `turtle_stage_draft_${stageNum}_${user?.username}`;
    const draftCode = localStorage.getItem(stageDraftKey);
    const submittedCode = codesList[stageNum];

    if (draftCode) {
      setCode(draftCode);
      setLastSavedCode(draftCode);
      setIsDirty(true);
    } else if (submittedCode) {
      setCode(submittedCode);
      setLastSavedCode(submittedCode);
      setIsDirty(false);
    } else {
      const template = getStageTemplate(stageNum);
      setCode(template);
      setLastSavedCode(template);
      setIsDirty(false);
    }
    setRunTrigger(0);
  };

  const handleResetPlayground = () => {
    if (window.confirm('Xóa sạch mọi bản nháp (kể cả bài vẽ mẫu) để làm lại từ đầu nhé? 🐢🗑️')) {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('turtle_playground_')) {
          localStorage.removeItem(key);
        }
      });
      handlePlaygroundMode('default', null, 'Playground 🎨');
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

  // GỌI AI CHẤM ĐIỂM CHẶNG
  const handleGrade = async () => {
    if (!activeStage) return;
    setIsGrading(true);
    setGraderResult(null);
    setIsDrawerOpen(false);

    try {
      const { data } = await lessonApi.gradeStage(activeStage, code);
      setGraderResult(data);

      if (data.is_correct) {
        // Bắn Pháo Confetti rực rỡ
        import('canvas-confetti').then((conf) => {
          conf.default({
            particleCount: 160,
            spread: 80,
            origin: { y: 0.6 }
          });
        });

        setShowSuccessModal(true);
        // Lưu tiến trình để mở khóa chặng tiếp theo
        await fetchStageProgress();
        // Xóa bản nháp cục bộ của chặng vừa qua
        const stageDraftKey = `turtle_stage_draft_${activeStage}_${user?.username}`;
        localStorage.removeItem(stageDraftKey);
      } else {
        // Mở Bảng Trượt gợi ý từ phải qua
        setIsDrawerOpen(true);
      }
    } catch (err) {
      const errMsg = err.response?.data?.detail || "Sư phụ Rùa đang bận luyện phép một lát rồi con ạ. Hãy thử nộp lại nhé! 🐢⏳";
      alert(errMsg);
    } finally {
      setIsGrading(false);
    }
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

  const handleResetCommands = () => {
    if (window.confirm('Khôi phục lại tập lệnh mặc định của Hiệp sĩ Rùa nhé? 🐢')) {
      syncCommands(DEFAULT_COMMANDS);
    }
  };

  return (
    <div className="flex h-screen bg-[var(--bg)] overflow-hidden font-nunito relative">
      <Sidebar
        onLoadProject={handleLoadProject}
        onNewProject={handleNewProject}
        onPlaygroundClick={handlePlaygroundMode}
        onResetPlayground={handleResetPlayground}
        hasUnsavedChanges={isDirty}
        completedStages={completedStages}
        selectedTitle={selectedTitle}
        activeStage={activeStage}
        onStageClick={handleStageClick}
      />

      <main className="flex-1 p-6 flex flex-col gap-4 overflow-hidden">
        <div className="flex justify-between items-center bg-white p-4 neo-card h-16 shrink-0 relative shadow-[4px_4px_0px_#1a1a1a]">
          <div className="flex items-center gap-4 flex-1">
            <div className={`px-3 py-1 border-2 border-[var(--border)] rounded-md font-black text-xs shadow-[2px_2px_0px_#1a1a1a] ${activeStage ? 'bg-[var(--cyan)]' : isPlayground ? 'bg-[var(--yellow)]' : 'bg-[var(--green)]'
              }`}>
              {activeStage ? 'CHẶNG HỌC 📜' : isPlayground ? 'BẢN NHÁP ✏️' : 'DỰ ÁN 🚀'}
            </div>
            <input
              type="text"
              value={projectTitle}
              disabled={isPlayground || activeStage !== null}
              onChange={(e) => setProjectTitle(e.target.value)}
              className={`font-black text-lg bg-transparent border-none outline-none focus:ring-2 focus:ring-[var(--cyan)] rounded px-2 w-full max-w-[400px] ${isPlayground || activeStage ? 'text-gray-400' : ''
                }`}
            />
          </div>

          <div className="flex gap-2 flex-1 justify-end items-center">
            {activeStage && (
              <button
                onClick={handleGrade}
                className="neo-btn-primary py-1 text-sm px-8 bg-[var(--orange)] active:translate-y-1 transition-all border-[var(--border)] shadow-[3px_3px_0px_#1a1a1a] hover:bg-[#ff8e4b] font-black uppercase text-white"
              >
                NỘP BÀI 🐢🏆
              </button>
            )}

            {!isPlayground && !activeStage && (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`neo-btn-secondary py-1 text-sm px-6 transition-all ${saveStatus === 'success' ? 'bg-[var(--green)]' :
                  saveStatus === 'error' ? 'bg-[var(--pink)]' :
                    isDirty ? 'bg-[#ff5f56] text-white ring-2 ring-red-400 shadow-[0_0_15px_rgba(255,95,86,0.6)] animate-pulse border-red-700' : 'bg-[#fcece2]'
                  }`}
              >
                {isSaving ? 'ĐANG LƯU...' : saveStatus === 'success' ? 'ĐÃ LƯU ✅' : isDirty ? 'LƯU NGAY! 💾' : 'LƯU 💾'}
              </button>
            )}

            <input type="file" id="upload-py" className="hidden" accept=".py,.txt" onChange={handleUpload} />
            <label htmlFor="upload-py" className="neo-btn-secondary py-1 px-3 bg-white flex items-center justify-center cursor-pointer shadow-[2px_2px_0px_#1a1a1a]" title="Tải code lên">
              📂
            </label>

            <button
              onClick={handleDownload}
              className="neo-btn-secondary py-1 px-3 bg-white flex items-center justify-center shadow-[2px_2px_0px_#1a1a1a]"
              title="Tải code về máy"
            >
              ➜]
            </button>

            <button
              onClick={() => setRunTrigger(prev => prev + 1)}
              className="neo-btn-primary py-1 text-sm px-8 bg-[var(--green)] active:translate-y-1 transition-all border-[var(--border)] shadow-[3px_3px_0px_#1a1a1a]"
            >
              CHẠY RÙA 🐢
            </button>
          </div>
        </div>

        <div className="flex-1 flex gap-4 overflow-hidden">
          <div className="flex-1 min-w-0 h-full flex flex-col">
            <div className="relative flex-1 flex flex-col">
              <Editor code={code} onChange={setCode} />
            </div>
          </div>

          <div className="w-[100px] h-full neo-card overflow-hidden shrink-0 shadow-[4px_4px_0px_#1a1a1a]">
            <CommandPalette
              commands={commands}
              onCommandClick={handleCommandClick}
              onAddClick={openAddModal}
              onEditClick={openEditModal}
              onResetClick={handleResetCommands}
            />
          </div>

          <div className="w-[550px] lg:w-[650px] xl:w-[750px] 2xl:w-[850px] shrink-0 h-full flex flex-col">
            <div className="flex-1 neo-card bg-white relative overflow-hidden flex flex-col shadow-[6px_6px_0px_#1a1a1a]">
              <div className="p-2 border-b-2 border-[var(--border)] bg-[var(--bg)] font-black text-sm text-center uppercase tracking-widest">
                Sân chơi của Rùa 🎨
              </div>
              <Preview
                code={code}
                runTrigger={runTrigger}
                onError={(err) => setRuntimeError({ msg: err, time: Date.now() })}
              />
            </div>
          </div>

          {/* BẢNG TRƯỢT GỢI Ý KHI LÀM SAI BÀI TẬP */}
          {isDrawerOpen && graderResult && (
            <div className="w-96 bg-white border-l-[3px] border-[var(--border)] flex flex-col h-full shrink-0 shadow-[-4px_0_0_rgba(0,0,0,0.15)] animate-in slide-in-from-right-10 duration-200">
              <div className="p-4 border-b-2 border-[var(--border)] bg-[var(--pink)] flex justify-between items-center">
                <span className="font-black text-base text-white">Gợi ý từ Sư phụ Rùa 🐢✨</span>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-7 h-7 bg-white border-2 border-[var(--border)] rounded-md flex items-center justify-center font-black shadow-[2px_2px_0px_#000] hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1 p-5 overflow-y-auto space-y-5 font-nunito bg-gray-50">
                <div className="bg-orange-50 border-2 border-[var(--border)] rounded-xl p-4 shadow-[4px_4px_0px_#1a1a1a]">
                  <div className="font-black text-sm text-[var(--orange)] mb-2 flex items-center gap-2">
                    <span>🐢</span> Điểm số bài làm: {graderResult.score} / 100
                  </div>
                  <p className="text-sm font-bold text-gray-700 leading-relaxed italic">
                    "{graderResult.explanation}"
                  </p>
                </div>

                <div className="bg-blue-50 border-2 border-[var(--border)] rounded-xl p-4 shadow-[4px_4px_0px_#1a1a1a]">
                  <div className="font-black text-sm text-blue-500 mb-2 flex items-center gap-2">
                    <span>💡</span> Manh mối phép thuật:
                  </div>
                  <p className="text-sm font-bold text-gray-700 leading-relaxed whitespace-pre-line">
                    {graderResult.suggestions}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {user && (
        <ChatbotBubble
          currentCode={code}
          errorLog={runtimeError}
        />
      )}

      <CommandModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCommand}
        onDelete={handleDeleteCommand}
        initialData={editingIndex !== null ? { ...commands[editingIndex], index: editingIndex } : null}
      />

      {/* OVERLAY LOADING KHI ĐANG CHẤM ĐIỂM */}
      {isGrading && (
        <div className="fixed inset-0 bg-black/50 z-50 flex flex-col items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white border-[3px] border-[var(--border)] rounded-2xl p-6 text-center max-w-xs shadow-[6px_6px_0px_#1a1a1a] flex flex-col items-center animate-pulse">
            <span className="text-5xl animate-bounce mb-4">🐢</span>
            <h4 className="font-black text-base uppercase">Đang nộp bài...</h4>
            <p className="text-xs font-bold text-gray-500 mt-2">Sư phụ Rùa đang soi kính lúp để chấm phép thuật vẽ của con, đợi một lát nhé! 🔍✨</p>
          </div>
        </div>
      )}

      {/* MODAL ĂN MỪNG THÀNH CÔNG RỰC RỠ */}
      {showSuccessModal && graderResult && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border-[3px] border-[var(--border)] rounded-3xl p-8 max-w-md w-full shadow-[8px_8px_0px_#1a1a1a] text-center relative overflow-hidden animate-in scale-in duration-200">
            <div className="absolute -top-10 -right-10 w-28 h-28 bg-[var(--yellow)] rounded-full -z-10 opacity-30 animate-pulse" />
            <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-[var(--cyan)] rounded-full -z-10 opacity-30 animate-pulse" />

            <span className="text-6xl mb-4 block animate-bounce">🏆🎉</span>

            <h3 className="text-2xl font-black uppercase text-[var(--green)] mb-2 tracking-tight">
              Vượt Chặng Thành Công!
            </h3>

            <div className="inline-block bg-[var(--yellow)] px-4 py-1.5 border-2 border-[var(--border)] rounded-full font-black text-sm shadow-[2px_2px_0px_#000] mb-4">
              Điểm số chặng: {graderResult.score} / 100 ⭐
            </div>

            <div className="bg-[var(--bg)] border-2 border-[var(--border)] rounded-2xl p-4 mb-6 text-left shadow-[4px_4px_0px_#1a1a1a]">
              <p className="text-sm font-bold text-gray-700 leading-relaxed">
                🐢 <span className="font-extrabold text-gray-900">Sư phụ Rùa nhận xét:</span>
                <br />
                <span className="italic mt-1 block text-gray-800 font-bold">"{graderResult.explanation}"</span>
              </p>
            </div>

            {graderResult.new_title_unlocked && (
              <div className="bg-purple-100 border-2 border-[var(--border)] rounded-2xl p-4 mb-6 text-center shadow-[4px_4px_0px_#1a1a1a] animate-pulse">
                <p className="text-xs font-black text-purple-600 uppercase mb-1">🎉 DANH HIỆU MỚI ĐÃ MỞ KHÓA! 🎉</p>
                <p className="text-lg font-black text-purple-950">{graderResult.new_title_unlocked}</p>
                <p className="text-[10px] font-bold text-purple-600 mt-1">Con có thể thay đổi biệt hiệu này trong trang Hồ sơ!</p>
              </div>
            )}

            <button
              onClick={() => {
                setShowSuccessModal(false);
                if (activeStage < 10) {
                  handleStageClick(activeStage + 1);
                } else {
                  alert("Chúc mừng chiến binh vĩ đại của ta! Con đã vượt qua toàn bộ 10 chặng thử thách của Sư phụ Rùa! 🏆🐢✨");
                }
              }}
              className="w-full py-3 bg-[var(--green)] border-2 border-[var(--border)] rounded-xl font-black text-base shadow-[4px_4px_0px_#1a1a1a] hover:translate-y-[1px] active:shadow-none transition-all uppercase tracking-widest text-white"
            >
              {activeStage < 10 ? 'Làm chặng tiếp theo ➡️' : 'Ta là Chiến binh Rùa! 🏆'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
