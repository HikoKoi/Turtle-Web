import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cropper from 'react-easy-crop';
import { useAuth } from '../../hooks/useAuth';
import authApi from '../../api/authApi';
import lessonApi from '../../api/lessonApi';

// Hàm helper để tạo ảnh đã cắt từ canvas
const getCroppedImg = (imageSrc, pixelCrop) => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg');
    };
    image.onerror = (error) => reject(error);
  });
};

export default function ProfilePage() {
  const { user, setUser, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  // CHẶN CỬA: Nếu chưa đăng nhập thì không cho xem gì hết, biến đi chỗ khác ngay! 🐢🚪
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const [activeTab, setActiveTab] = useState('info');
  const [showPassword, setShowPassword] = useState(false);

  // States cho Upload & Crop Avatar
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropper, setShowCropper] = useState(false);

  // Trạng thái Danh hiệu & Tiến trình
  const [completedStages, setCompletedStages] = useState([]);
  const [unlockedTitles, setUnlockedTitles] = useState(["Hiệp sĩ tập sự"]);
  const [selectedTitle, setSelectedTitle] = useState("Hiệp sĩ tập sự");

  const fetchProgress = async () => {
    try {
      const { data } = await lessonApi.getStageProgress();
      setCompletedStages(data.completed_stages || []);
      setUnlockedTitles(data.unlocked_titles || ["Hiệp sĩ tập sự"]);
      setSelectedTitle(data.selected_title || "Hiệp sĩ tập sự");
    } catch (err) {
      console.error("Lỗi khi tải tiến trình:", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProgress();
    }
  }, [user]);

  const handleSelectTitle = async (titleName) => {
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const { data } = await lessonApi.updateTitle(titleName);
      setSelectedTitle(data.selected_title);
      setUser({ ...user, selected_title: data.selected_title });
      setMessage({ type: 'success', text: 'Đổi danh hiệu thành công! Oai phong quá con ơi! 👑🦁' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: getErrorText(err.response?.data, 'Lỗi khi đổi danh hiệu! ❌') });
    } finally {
      setIsLoading(false);
    }
  };

  const [infoData, setInfoData] = useState({
    first_name: user?.first_name || '',
    email: user?.email || '',
    phone_number: user?.phone_number || '',
    birthday: user?.birthday || '',
  });

  const [securityData, setSecurityData] = useState({
    username: user?.username || '',
    old_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleInfoChange = (e) => setInfoData({ ...infoData, [e.target.name]: e.target.value });
  const handleSecurityChange = (e) => setSecurityData({ ...securityData, [e.target.name]: e.target.value });

  const validateUsername = (username) => {
    const regex = /^[a-zA-Z](?=.*[0-9!@#$%^&*])/;
    return regex.test(username);
  };

  // --- HÀM DỊCH LỖI SANG TIẾNG VIỆT ---
  const translateError = (errorMsg) => {
    if (!errorMsg || typeof errorMsg !== 'string') return errorMsg;

    const dictionary = {
      'Enter a valid email address.': 'Email không đúng định dạng rồi bạn ơi! 🐢',
      'This field may not be blank.': 'Ô này không được để trống nhé! ✨',
      'This field is required.': 'Con hãy điền thông tin vào đây nhé!',
      'Ensure this value has at least 8 characters': 'Mật khẩu phải dài ít nhất 8 ký tự nhé!',
      'Enter a valid phone number.': 'Số điện thoại chưa đúng rồi! 📞',
      'Old password is not correct': 'Mật khẩu cũ không chính xác! ❌',
      'This field may not be null.': 'Thông tin này không được bỏ trống nhé!',
      'A user with that username already exists.': 'Tên đăng nhập này đã có người dùng rồi!',
    };

    for (const [key, value] of Object.entries(dictionary)) {
      if (errorMsg.toLowerCase().includes(key.toLowerCase())) return value;
    }
    return errorMsg;
  };

  const getErrorText = (errorData, defaultText) => {
    if (!errorData) return defaultText;
    if (typeof errorData === 'string') return translateError(errorData);

    const firstError = Object.values(errorData)[0];
    const msg = Array.isArray(firstError) ? firstError[0] : firstError;
    return translateError(msg);
  };

  // --- XỬ LÝ CHỌN ẢNH ---
  const onFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result);
        setShowCropper(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((_croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSaveAvatar = async () => {
    setIsLoading(true);
    try {
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      const formData = new FormData();
      formData.append('avatar', croppedImageBlob, 'avatar.jpg');

      const { data } = await authApi.updateProfile(formData);
      setUser({ ...user, avatar: data.data.avatar });
      setShowCropper(false);
      setMessage({ type: 'success', text: 'Đổi ảnh đại diện thành công! ✨' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: getErrorText(err.response?.data, 'Lỗi khi tải ảnh lên! ❌') });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateInfo = async () => {
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    const cleanData = {};
    Object.keys(infoData).forEach(key => {
      if (infoData[key] !== '' && infoData[key] !== null) cleanData[key] = infoData[key];
    });

    try {
      const { data } = await authApi.updateProfile(cleanData);
      setUser({ ...user, ...data.data });
      setMessage({ type: 'success', text: 'Cập nhật thông tin thành công! ✅' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: getErrorText(err.response?.data, 'Lỗi cập nhật thông tin! ❌') });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSecurity = async () => {
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    let hasChangedUsername = securityData.username !== user.username;
    let hasPasswordInput = securityData.old_password || securityData.new_password || securityData.confirm_password;

    try {
      if (!hasChangedUsername && !hasPasswordInput) throw new Error('Bé chưa thay đổi thông tin nào mà! 🐢');
      if (hasChangedUsername) {
        if (!validateUsername(securityData.username)) throw new Error("Username bắt đầu bằng chữ, chứa ít nhất 1 số hoặc ký tự đặc biệt.");
        await authApi.updateProfile({ username: securityData.username });
      }
      if (hasPasswordInput) {
        if (!securityData.old_password || !securityData.new_password || !securityData.confirm_password) throw new Error("Bé hãy nhập đủ cả 3 ô mật khẩu nhé! 🔑");
        if (securityData.new_password.length < 8) throw new Error("Mật khẩu mới phải dài ít nhất 8 ký tự nhé!");
        if (securityData.new_password !== securityData.confirm_password) throw new Error("Mật khẩu mới và xác nhận chưa khớp nhau! ❌");
        await authApi.changePassword({ old_password: securityData.old_password, new_password: securityData.new_password, confirm_password: securityData.confirm_password });
      }
      if (hasChangedUsername) setUser({ ...user, username: securityData.username });
      setMessage({ type: 'success', text: 'Cập nhật bảo mật thành công! 🔐' });
      setSecurityData({ ...securityData, old_password: '', new_password: '', confirm_password: '' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: getErrorText(err.response?.data, err.message || 'Lỗi cập nhật bảo mật! ❌') });
    } finally {
      setIsLoading(false);
    }
  };

  const getAvatarUrl = () => {
    if (!user?.avatar) return null;
    if (user.avatar.startsWith('http')) return user.avatar;
    return `http://127.0.0.1:8000${user.avatar}`;
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] p-4 md:p-8 font-nunito flex flex-col items-center">
      {/* Cropper Modal */}
      {showCropper && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex flex-col items-center justify-center p-4">
          <div className="relative w-full max-w-lg aspect-square bg-white rounded-2xl overflow-hidden border-8 border-white">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>
          <div className="mt-6 w-full max-w-lg bg-white p-6 rounded-2xl neo-card">
            <p className="text-center font-black text-xs uppercase mb-4">Phóng to / Thu nhỏ</p>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => setZoom(e.target.value)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[var(--orange)] mb-6"
            />
            <div className="flex gap-4">
              <button onClick={() => setShowCropper(false)} className="flex-1 py-3 neo-btn-secondary bg-white font-black text-xs uppercase">Hủy bỏ</button>
              <button onClick={handleSaveAvatar} disabled={isLoading} className="flex-[2] py-3 neo-btn-primary bg-[var(--yellow)] font-black text-xs uppercase">
                {isLoading ? 'Đang lưu...' : 'Xác nhận ảnh này ✨'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="w-full max-w-2xl mb-8 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="neo-btn-secondary py-2 px-6 bg-white flex items-center gap-2">🔙 QUAY LẠI</button>
        <h1 className="font-black text-2xl uppercase tracking-widest hidden sm:block">Hồ sơ hiệp sĩ</h1>
      </div>

      <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-1">
          <div className="neo-card bg-white p-6 flex flex-col items-center gap-4 sticky top-8">
            <div className="relative group">
              <div className="w-32 h-32 bg-[var(--yellow)] border-4 border-[var(--border)] rounded-full flex items-center justify-center text-6xl shadow-[4px_4px_0px_#000] overflow-hidden">
                {user?.avatar ? (
                  <img src={getAvatarUrl()} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  '🐢'
                )}
              </div>
              <label htmlFor="avatar-upload" className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                <span className="text-white font-black text-[10px] uppercase">Đổi ảnh</span>
              </label>
              <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={onFileChange} />
            </div>

            <div className="text-center w-full">
              <p className="text-[10px] font-black text-amber-600 uppercase tracking-wider mb-0.5">{selectedTitle || 'Hiệp sĩ tập sự'}</p>
              <h2 className="font-black text-lg uppercase truncate">{user?.first_name || user?.username || 'Hiệp sĩ Rùa'}</h2>
              <p className="text-[10px] font-black text-gray-400 uppercase">@{user?.username || 'username'}</p>
            </div>

            <div className="w-full pt-4 border-t-2 border-[var(--bg)] text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase">Ngày gia nhập</p>
              <p className="font-bold text-xs">{user?.date_joined ? new Date(user.date_joined).toLocaleDateString('vi-VN') : 'Mới tham gia'}</p>
            </div>
          </div>
        </div>

        {/* Forms Accordion */}
        <div className="md:col-span-2 flex flex-col gap-4">
          {message.text && (
            <div className={`p-4 neo-card font-black text-sm text-center animate-in fade-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-[var(--green)]' : 'bg-[var(--pink)]'}`}>
              {message.text}
            </div>
          )}

          {/* SECTION 1: INFO */}
          <div className="neo-card bg-white overflow-hidden transition-all duration-300">
            <button onClick={() => setActiveTab('info')} className={`w-full p-6 flex justify-between items-center font-black text-left uppercase ${activeTab === 'info' ? 'bg-[var(--yellow)]' : 'hover:bg-gray-50'}`}>
              <span>👤 Thông tin cá nhân</span>
              <span className="text-xl">{activeTab === 'info' ? '−' : '+'}</span>
            </button>
            <div className={`p-6 space-y-4 ${activeTab === 'info' ? 'block' : 'hidden'} animate-in slide-in-from-top-2`}>
              <div>
                <label className="block text-[10px] font-black uppercase mb-1 text-gray-400">Tên hiển thị</label>
                <input name="first_name" placeholder="Ví dụ: Rùa Con, Ben, Moon..." value={infoData.first_name} onChange={handleInfoChange} className="w-full p-3 border-2 border-[var(--border)] rounded-lg font-bold bg-[var(--bg)] outline-none focus:ring-4 focus:ring-[var(--yellow)]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase mb-1 text-gray-400">Ngày sinh</label>
                  <input type="date" name="birthday" value={infoData.birthday} onChange={handleInfoChange} className="w-full p-3 border-2 border-[var(--border)] rounded-lg font-bold bg-[var(--bg)] outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase mb-1 text-gray-400">Số điện thoại</label>
                  <input type="tel" name="phone_number" placeholder="09xx xxx xxx" value={infoData.phone_number} onChange={handleInfoChange} className="w-full p-3 border-2 border-[var(--border)] rounded-lg font-bold bg-[var(--bg)] outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase mb-1 text-gray-400">Email</label>
                <input type="email" name="email" placeholder="email@vidu.com" value={infoData.email} onChange={handleInfoChange} className="w-full p-3 border-2 border-[var(--border)] rounded-lg font-bold bg-[var(--bg)] outline-none" />
              </div>
              <button onClick={handleUpdateInfo} disabled={isLoading} className="w-full py-3 mt-4 neo-btn-primary bg-[var(--yellow)] font-black text-sm uppercase">Lưu thay đổi 💾</button>
            </div>
          </div>

          {/* SECTION 3: TITLES */}
          <div className="neo-card bg-white overflow-hidden transition-all duration-300">
            <button onClick={() => setActiveTab('titles')} className={`w-full p-6 flex justify-between items-center font-black text-left uppercase ${activeTab === 'titles' ? 'bg-[var(--cyan)] text-white' : 'hover:bg-gray-50'}`}>
              <span>🏆 Danh hiệu của bé</span>
              <span className="text-xl">{activeTab === 'titles' ? '−' : '+'}</span>
            </button>
            <div className={`p-6 space-y-4 ${activeTab === 'titles' ? 'block' : 'hidden'} animate-in slide-in-from-top-2`}>
              <p className="text-xs font-bold text-gray-500 mb-4 leading-relaxed">
                Vượt qua các chặng thử thách của Sư phụ Rùa để tích lũy điểm số và mở khóa các danh hiệu oai phong nhé! Con hãy bấm vào danh hiệu đã mở khóa để kích hoạt. 🐢⚡
              </p>
              
              <div className="space-y-4">
                {[
                  { key: "Hiệp sĩ tập sự", name: "Hiệp Sĩ Tập Sự ⚔️", desc: "Danh hiệu khởi đầu cho mọi hiệp sĩ nhỏ khi mới gia nhập thế giới Turtle Code." },
                  { key: "Họa Sĩ Sắc Màu 🎨", name: "Họa Sĩ Sắc Màu 🎨", desc: "Mở khóa khi hoàn thành Chặng 2. Bạn đã biết pha màu vẽ và tô kín màu cho chú Rùa!" },
                  { key: "Chúa Tể Vòng Lặp 🔄", name: "Chúa Tể Vòng Lặp 🔄", desc: "Mở khóa khi hoàn thành Chặng 4. Thành thạo phép thuật lặp vô tận giúp vẽ hoa văn siêu nhanh!" },
                  { key: "Phù Thủy Tọa Độ 🌀", name: "Phù Thủy Tọa Độ 🌀", desc: "Mở khóa khi hoàn thành Chặng 7. Điều khiển Rùa bay nhảy chính xác đến từng tọa độ trên sân vẽ!" },
                  { key: "Chiến Binh Rùa Thần 🏆", name: "Chiến Binh Rùa Thần 🏆", desc: "Danh hiệu tối cao! Mở khóa khi hoàn thành toàn bộ 10 Chặng thử thách vĩ đại." }
                ].map((t) => {
                  const isUnlocked = unlockedTitles.some(ut => ut.toLowerCase().replace(/[^a-z0-9]/g, '') === t.key.toLowerCase().replace(/[^a-z0-9]/g, ''));
                  const isActive = selectedTitle.toLowerCase().replace(/[^a-z0-9]/g, '') === t.key.toLowerCase().replace(/[^a-z0-9]/g, '');

                  return (
                    <div 
                      key={t.key}
                      onClick={() => isUnlocked && handleSelectTitle(t.key)}
                      className={`p-4 border-2 rounded-xl transition-all flex items-center justify-between gap-4 select-none ${
                        isActive 
                          ? 'bg-amber-50 border-amber-400 shadow-[4px_4px_0px_#d97706]' 
                          : isUnlocked 
                          ? 'bg-white border-[var(--border)] hover:bg-gray-50 hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_#1a1a1a] cursor-pointer' 
                          : 'bg-gray-100 border-gray-200 text-gray-400 opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-black text-sm ${isActive ? 'text-amber-700' : isUnlocked ? 'text-gray-900' : 'text-gray-400'}`}>
                            {t.name}
                          </span>
                          {isActive && (
                            <span className="bg-amber-400 border border-amber-600 text-amber-950 text-[9px] font-black px-2 py-0.5 rounded-full uppercase leading-none shadow-[1px_1px_0px_rgba(0,0,0,0.15)] animate-pulse">
                              Đang dùng
                            </span>
                          )}
                          {!isUnlocked && (
                            <span className="text-[10px] font-bold text-gray-400 uppercase">🔒 Chưa mở khóa</span>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-gray-500 mt-1 leading-relaxed">{t.desc}</p>
                      </div>
                      
                      <div className="shrink-0 select-none">
                        {isActive ? (
                          <span className="text-2xl">🌟</span>
                        ) : isUnlocked ? (
                          <span className="text-xl">🔓</span>
                        ) : (
                          <span className="text-xl">🔒</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SECTION 2: SECURITY */}
          <div className="neo-card bg-white overflow-hidden transition-all duration-300">
            <button onClick={() => setActiveTab('security')} className={`w-full p-6 flex justify-between items-center font-black text-left uppercase ${activeTab === 'security' ? 'bg-[var(--pink)] text-white' : 'hover:bg-gray-50'}`}>
              <span>🔐 Bảo mật tài khoản</span>
              <span className="text-xl">{activeTab === 'security' ? '−' : '+'}</span>
            </button>
            <div className={`p-6 space-y-4 ${activeTab === 'security' ? 'block' : 'hidden'} animate-in slide-in-from-top-2`}>
              <div>
                <label className="block text-[10px] font-black uppercase mb-1 text-gray-400">Tên đăng nhập</label>
                <input name="username" placeholder="Tên dùng để đăng nhập..." value={securityData.username} onChange={handleSecurityChange} className="w-full p-3 border-2 border-[var(--border)] rounded-lg font-bold bg-[var(--bg)] outline-none" />
              </div>
              <div className="pt-4 border-t-2 border-gray-100 space-y-4">
                <p className="text-[10px] font-black uppercase text-gray-400 italic">Thay đổi mật khẩu:</p>
                {[
                  { name: 'old_password', placeholder: 'Mật khẩu hiện tại' },
                  { name: 'new_password', placeholder: 'Mật khẩu mới (ít nhất 8 ký tự)' },
                  { name: 'confirm_password', placeholder: 'Xác nhận mật khẩu mới' }
                ].map((field) => (
                  <div key={field.name} className="relative">
                    <input type={showPassword ? "text" : "password"} name={field.name} placeholder={field.placeholder} value={securityData[field.name]} onChange={handleSecurityChange} className="w-full p-3 border-2 border-[var(--border)] rounded-lg font-bold bg-[var(--bg)] outline-none pr-12" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xl hover:scale-110 transition-transform">
                      {showPassword ? '👁️' : '🙈'}
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={handleUpdateSecurity} disabled={isLoading} className="w-full py-3 mt-4 neo-btn-primary bg-[var(--pink)] text-white font-black text-sm uppercase">Cập nhật bảo mật 🛡️</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
