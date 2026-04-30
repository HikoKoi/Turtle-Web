import { useEffect, useRef } from 'react';

export default function Preview({ code, runTrigger }) {
  const canvasRef = useRef(null);
  const outputRef = useRef(null);

  const runPython = () => {
    if (!window.Sk) return;

    // 1. Dọn dẹp nội dung cũ
    if (outputRef.current) outputRef.current.innerHTML = '';
    if (canvasRef.current) canvasRef.current.innerHTML = '';

    // 2. Lấy kích thước thực tế của khung chứa để báo cho Skulpt
    const container = canvasRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const builtinRead = (x) => {
      if (window.Sk.builtinFiles === undefined || window.Sk.builtinFiles["files"][x] === undefined)
        throw "File not found: '" + x + "'";
      return window.Sk.builtinFiles["files"][x];
    };

    // 3. Cấu hình Skulpt
    window.Sk.configure({
      output: (text) => {
        if (outputRef.current) outputRef.current.innerHTML += text;
      },
      read: builtinRead,
      inputfun: (args) => {
        return new Promise((resolve) => {
          const promptMsg = args || "Bé muốn nhập gì vào dòng này? 🐢✨";
          const result = window.prompt(promptMsg);
          resolve(result);
        });
      },
    });

    // QUAN TRỌNG: Thiết lập kích thước Canvas để Rùa không bị lệch
    window.Sk.TurtleGraphics = {
      target: container,
      width: width,
      height: height
    };

    const myPromise = window.Sk.misceval.asyncToPromise(() => {
      return window.Sk.importMainWithBody("<stdin>", false, code, true);
    });

    myPromise.then(
      () => console.log("Success!"),
      (err) => {
        if (outputRef.current) {
          outputRef.current.innerHTML = `<span style="color: #ff5f56; font-weight: 900;">⚠️ Lỗi rồi Hiệp sĩ ơi:</span><br/>${err.toString()}`;
        }
      }
    );
  };

  useEffect(() => {
    if (runTrigger > 0) {
      runPython();
    }
  }, [runTrigger]);

  return (
    <div className="flex-1 flex flex-col h-full bg-white relative">
      {/* Vùng Canvas: Bỏ flex centering để tránh lệch tọa độ */}
      <div
        ref={canvasRef}
        id="turtle-canvas"
        className="flex-1 w-full h-full overflow-hidden relative"
        style={{
          backgroundColor: '#ffffff',
          backgroundImage: `
            linear-gradient(to right, #f2f2f2 1px, transparent 1px),
            linear-gradient(to bottom, #f2f2f2 1px, transparent 1px),
            linear-gradient(to right, #e5e5e5 1px, transparent 1px),
            linear-gradient(to bottom, #e5e5e5 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px, 20px 20px, 100px 100px, 100px 100px',
          backgroundPosition: 'center center'
        }}
      >
        {/* Điểm (0,0) Marker mờ */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[1px] bg-red-100 pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1px] h-full bg-red-100 pointer-events-none"></div>
        {/* Skulpt sẽ vẽ canvas vào đây */}
      </div>

      {/* Nhật ký Rùa */}
      <div className="h-24 border-t-2 border-[var(--border)] bg-[var(--bg)] p-3 overflow-y-auto custom-scrollbar shrink-0">
        <div className="text-[10px] font-black uppercase text-gray-400 mb-1">Nhật ký của Rùa</div>
        <pre ref={outputRef} className="font-mono text-[11px] text-gray-600 whitespace-pre-wrap"></pre>
      </div>
    </div>
  );
}
