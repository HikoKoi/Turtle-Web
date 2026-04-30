import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center p-6 text-center">
      <div className="text-9xl mb-4">🐢❓</div>
      <h1 className="text-4xl font-black uppercase mb-4 text-[var(--border)]">
        Ối! Bé lạc đường rồi!
      </h1>
      <p className="text-lg font-bold text-gray-500 mb-8 max-w-md">
        Rùa không tìm thấy trang này trong bản đồ phép thuật. Bé hãy quay lại xưởng vẽ để tiếp tục sáng tạo nhé!
      </p>
      <Link 
        to="/" 
        className="neo-btn-primary px-8 py-3 bg-[var(--green)] font-black uppercase flex items-center gap-2"
      >
        🏠 QUAY VỀ XƯỞNG VẼ
      </Link>
    </div>
  );
}
