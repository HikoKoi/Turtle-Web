import json
import google.generativeai as genai
from pydantic import BaseModel, Field
from django.conf import settings

# Cấu hình Gemini
genai.configure(api_key=settings.GEMINI_API_KEY)

# Định nghĩa cấu trúc JSON phản hồi mong muốn
class GraderResponse(BaseModel):
    is_correct: bool = Field(description="Đúng (True) nếu code vẽ chính xác đề bài chặng yêu cầu, Ngược lại là Sai (False) nếu thiếu hoặc chạy sai yêu cầu.")
    score: int = Field(description="Điểm số của bài làm từ 0 đến 100")
    explanation: str = Field(description="Lời nhận xét sư phạm ấm áp từ 'Sư phụ Rùa' xưng 'Ta' gọi 'Con' bằng tiếng Việt. Nếu sai, giải thích nhẹ nhàng lỗi ở đâu.")
    suggestions: str = Field(description="Gợi ý/manh mối trực quan để bé sửa lỗi bằng tiếng Việt. TUYỆT ĐỐI không đưa thẳng code giải.")

def get_stage_requirements(stage_number):
    stages = {
        1: "Vẽ bậc thang đi lên bằng các lệnh cơ bản forward, left(90), right(90). Không nhất thiết phải tô màu.",
        2: "Vẽ một hình tam giác cân/đều có nét viền màu xanh lá (pencolor('green') hoặc tương đương) dày (pensize >= 5), bên trong được tô kín màu vàng bằng fillcolor('yellow'), begin_fill() và end_fill().",
        3: "Sử dụng biến số (ví dụ: canh, kich_thuoc) để vẽ một hình chữ nhật nằm ngang có chiều dài gấp đôi chiều rộng (ví dụ: canh * 2 và canh).",
        4: "Dùng vòng lặp for i in range(6) (hoặc số lần tương tự) để vẽ một hình lục giác đều (6 cạnh) rực rỡ nét vẽ.",
        5: "Dùng penup(), pendown() và goto() để di chuyển và vẽ ít nhất 2 hình tròn (hoặc hình tròn và hình vuông) không chạm nhau, nằm ở các góc khác nhau trên màn hình.",
        6: "Sử dụng cấu trúc điều kiện if/else để kiểm tra tọa độ xcor() của Rùa. Nếu xcor() > 100 thì tự động đổi nét bút thành màu đỏ (red), ngược lại giữ màu xanh dương (blue).",
        7: "Dùng vòng lặp while để vẽ đường xoắn ốc tăng dần kích thước nét vẽ (ví dụ: buoc_di += 4) và bắt buộc có lệnh break để ngắt vòng lặp dừng lại khi kích thước lớn hơn 150.",
        8: "Tạo một danh sách chứa ít nhất 4 màu sắc (ví dụ: red, blue, yellow, orange...) và sử dụng random.choice() kết hợp vòng lặp để vẽ bông hoa tròn đa sắc gồm nhiều cánh/hình tròn lồng nhau.",
        9: "Tự định nghĩa một hàm riêng không có tham số (ví dụ: def ve_ngoi_sao() hoặc def ve_bong_hoa()) để vẽ một hình mẫu, sau đó dùng nhấc bút/đặt bút di chuyển Rùa tới ít nhất 2 vị trí khác nhau để triệu hồi hàm vẽ hình mẫu đó.",
        10: "Tự định nghĩa một hàm có tham số biến hóa nâng cao (ví dụ: def ve_bong_bong(x, y, ban_kinh, mau)) để di chuyển và vẽ hình cầu sắc màu. Sau đó gọi hàm này ít nhất 3 lần để thổi ra 3 bong bóng to nhỏ có màu sắc khác nhau rải rác trên màn hình."
    }
    return stages.get(stage_number, "Không có yêu cầu bài tập cho chặng này.")

def grade_student_code(stage_number, code_content):
    stage_requirements = get_stage_requirements(stage_number)
    
    prompt = (
        f"Bạn là 'Sư phụ Rùa' thông thái chuyên dạy Python Turtle cho trẻ em.\n"
        f"Nhiệm vụ của bạn là chấm điểm bài làm lập trình của học sinh.\n\n"
        f"--- YÊU CẦU ĐỀ BÀI CHẶNG {stage_number} ---\n"
        f"{stage_requirements}\n\n"
        f"--- MÃ NGUỒN CỦA BÉ ---\n"
        f"```python\n{code_content}\n```\n\n"
        f"Yêu cầu:\n"
        f"1. Phân tích thật kỹ code của bé. Bé có làm đúng yêu cầu đề bài chặng {stage_number} không?\n"
        f"2. Nếu bé làm đúng, hãy khen ngợi ấm áp và cho điểm cao (từ 90 đến 100).\n"
        f"3. Nếu thiếu lệnh quan trọng (ví dụ chặng 3 không dùng biến số, chặng 4 không dùng for, chặng 7 không dùng while/break, chặng 10 không định nghĩa hàm có tham số), bạn phải đánh giá là SAI (is_correct=False), hạ điểm và hướng dẫn bé nhẹ nhàng, xưng là 'Sư phụ' gọi bé là 'Con'.\n"
        f"4. TUYỆT ĐỐI không bao giờ cung cấp mã nguồn đáp án trực tiếp trong phần giải thích hay gợi ý.\n"
        f"5. Hãy trả về kết quả định dạng JSON chuẩn khớp với cấu trúc."
    )

    model = genai.GenerativeModel(model_name="gemini-3.1-flash-lite")
    
    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                response_schema=GraderResponse,
            ),
        )
        return json.loads(response.text)
    except Exception as e:
        # Dự phòng nếu lỗi API hoặc lỗi phân tách JSON
        return {
            "is_correct": False,
            "score": 0,
            "explanation": f"Ối! Sư phụ Rùa đang bận luyện phép một lát rồi con ạ. Hãy thử nộp lại nhé! (Chi tiết: {str(e)})",
            "suggestions": "Hãy kiểm tra xem kết nối internet hoặc thử chạy lại code xem sao nhé!"
        }
