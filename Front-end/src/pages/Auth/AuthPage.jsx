import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function AuthPage() {
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const [mode, setMode] = useState('login');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [form, setForm] = useState({
        username: '',
        password: '',
        confirmPassword: '',
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // --- KIỂM TRA DỮ LIỆU THỦ CÔNG ---
        if (!form.username.trim()) {
            setError('Đừng quên nhập Tên đăng nhập bạn ơi! 🐢');
            setIsLoading(false);
            return;
        }

        if (!form.password) {
            setError('Bạn chưa nhập Mật khẩu kìa! 🐢');
            setIsLoading(false);
            return;
        }

        if (mode === 'register') {
            if (!form.confirmPassword) {
                setError('Hãy nhập lại mật khẩu để chắc chắn nhé! 🐢');
                setIsLoading(false);
                return;
            }
            if (form.password !== form.confirmPassword) {
                setError('Mật khẩu nhập lại không khớp! ❌');
                setIsLoading(false);
                return;
            }
        }

        try {
            if (mode === 'login') {
                await login({ username: form.username, password: form.password });
                navigate('/');
            } else {
                await register({ username: form.username, password: form.password });
                alert('Đăng ký thành công! Hãy đăng nhập nhé ✨');
                setMode('login');
                setForm(prev => ({ ...prev, password: '', confirmPassword: '' }));
            }
        } catch (err) {
            const data = err.response?.data;

            if (data?.password) {
                const pMsg = data.password[0];
                if (pMsg.includes('too short')) {
                    setError('Mật khẩu ngắn quá, phải ít nhất 8 ký tự bạn nhé! 🐢');
                } else if (pMsg.includes('too common')) {
                    setError('Mật khẩu này dễ đoán quá, thử cái khác khó hơn xem! 🔐');
                } else {
                    setError(pMsg);
                }
            }
            else if (JSON.stringify(data).includes('already exists')) {
                setError('Tên đăng nhập này đã có bạn dùng rồi! Thử tên khác nhé 🐢');
            }
            else if (data?.detail?.includes('No active account found')) {
                setError('Sai tên đăng nhập hoặc mật khẩu rồi! ❌');
            }
            else {
                setError('Có lỗi xảy ra: ' + (data?.error || data?.detail || 'Vui lòng thử lại!'));
            }

            setForm(prev => ({ ...prev, password: '', confirmPassword: '' }));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4 py-12">
            <div className="relative w-full max-w-[420px]">
                <div className="neo-card p-8 pt-14 relative overflow-hidden bg-white">
                    {/* Nút quay lại nằm bên trong ô */}
                    <button 
                        onClick={() => navigate('/')} 
                        className="absolute top-4 left-4 neo-btn-secondary py-1.5 px-3 bg-white text-[9px] font-black uppercase transition-all active:translate-y-1 shadow-[2px_2px_0px_#000] hover:bg-[var(--yellow)] z-10"
                    >
                        🔙 QUAY LẠI
                    </button>

                    <div className="flex flex-col items-center mb-6">
                        <div className="w-20 h-20 bg-white border-[3px] border-[var(--border)] rounded-2xl flex items-center justify-center mb-4 shadow-[4px_4px_0px_#1a1a1a]">
                            <span className="text-5xl">🐢</span>
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-center uppercase">
                            {mode === 'login' ? 'MỪNG CON TRỞ LẠI!' : 'BẮT ĐẦU HÀNH TRÌNH'}
                        </h1>
                    </div>

                    {/* Form với noValidate để tự xử lý lỗi */}
                    <form onSubmit={handleSubmit} noValidate className="space-y-5">
                        <div>
                            <label className="block text-sm font-black mb-1.5 ml-1 text-gray-500 uppercase tracking-tighter text-[10px]">Tên đăng nhập</label>
                            <input
                                type="text"
                                name="username"
                                placeholder="Ví dụ: HiepSiRua99"
                                value={form.username}
                                onChange={handleChange}
                                className="neo-input"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between mb-1.5 px-1">
                                <label className="text-sm font-black text-gray-500 uppercase tracking-tighter text-[10px]">Mật khẩu</label>
                                {mode === 'login' && (
                                    <button type="button" className="text-[10px] font-black text-[var(--cyan-dark)] hover:underline uppercase">
                                        Quên mật khẩu?
                                    </button>
                                )}
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={handleChange}
                                    className="neo-input pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xl hover:scale-110 transition-transform"
                                >
                                    {showPassword ? '👁️' : '🙈'}
                                </button>
                            </div>
                        </div>

                        {mode === 'register' && (
                            <div>
                                <label className="block text-sm font-black mb-1.5 ml-1 text-gray-500 uppercase tracking-tighter text-[10px]">Xác nhận mật khẩu</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        placeholder="••••••••"
                                        value={form.confirmPassword}
                                        onChange={handleChange}
                                        className="neo-input pr-12"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xl hover:scale-110 transition-transform"
                                    >
                                        {showPassword ? '👁️' : '🙈'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="p-3 bg-red-100 border-2 border-red-400 rounded-lg text-red-700 text-xs font-bold shadow-[2px_2px_0px_#f87171] animate-in fade-in slide-in-from-top-1">
                                ⚠️ {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="neo-btn-primary w-full mt-2 uppercase tracking-widest text-lg py-4"
                        >
                            {isLoading ? 'Đang xử lý...' : 'XÁC NHẬN'}
                        </button>
                    </form>

                    <div className="flex items-center my-8">
                        <div className="flex-1 h-[2.5px] bg-[var(--border)]"></div>
                        <span className="px-4 font-black text-sm uppercase">HOẶC</span>
                        <div className="flex-1 h-[2.5px] bg-[var(--border)]"></div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button type="button" className="neo-btn-secondary flex items-center justify-center gap-2 text-sm" style={{ background: '#fcece2' }}>
                            <span className="text-lg font-black">G</span> Google
                        </button>
                        <button type="button" className="neo-btn-secondary flex items-center justify-center gap-2 text-sm" style={{ background: '#8ed1f7' }}>
                            <span className="text-lg font-black">f</span> Facebook
                        </button>
                    </div>

                    <div className="mt-8 text-center">
                        <button
                            type="button"
                            onClick={() => {
                                setMode(mode === 'login' ? 'register' : 'login');
                                setError('');
                            }}
                            className="text-sm font-black hover:text-[var(--orange-dark)] transition-colors underline decoration-2 underline-offset-4"
                        >
                            {mode === 'login' ? "Chưa có tài khoản? Đăng ký ngay" : "Đã có tài khoản? Đăng nhập"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
