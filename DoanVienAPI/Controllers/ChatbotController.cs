using Microsoft.AspNetCore.Mvc;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using Microsoft.Extensions.Configuration;
using System.IO;

namespace DoanVienAPI.Controllers
{
    public class AskRequest
    {
        public string? Question { get; set; }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class ChatbotController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public ChatbotController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        [HttpPost("ask")]
        public async Task<IActionResult> Ask([FromBody] AskRequest request)
        {
            if (string.IsNullOrEmpty(request.Question))
                return BadRequest(new { answer = "Bạn chưa nhập câu hỏi." });

            try
            {
                // 1. ĐỌC DỮ LIỆU
                string filePath = Path.Combine(Directory.GetCurrentDirectory(), "data.txt");
                if (!System.IO.File.Exists(filePath))
                {
                    return Ok(new { answer = "Lỗi Server: Không tìm thấy file data.txt." });
                }
                string knowledgeBase = await System.IO.File.ReadAllTextAsync(filePath);

                // 2. CẤU HÌNH GEMINI (Giữ nguyên)
                var apiKey = _configuration["Gemini:ApiKey"];
                string modelName = "gemini-2.5-flash";
                string apiUrl = $"https://generativelanguage.googleapis.com/v1beta/models/{modelName}:generateContent?key={apiKey}";

                // 3. PROMPT THẦN THÁNH (ĐÃ CẬP NHẬT THEO Ý BẠN)
                // Ép buộc dùng gạch đầu dòng và trả lời cả kiến thức ngoài
                string finalPrompt = $@"
Bạn là Trợ lý ảo của HUTECH.
Dữ liệu nội bộ:
---
{knowledgeBase}
---

YÊU CẦU TRẢ LỜI:
1. Thông tin phải CHÍNH XÁC tuyệt đối theo dữ liệu.
2. PHONG CÁCH: Cực kỳ ngắn gọn, súc tích, đi thẳng vào vấn đề.
3. ĐỊNH DẠNG: Ưu tiên dùng gạch đầu dòng (-) để liệt kê ý chính. Không viết văn dài dòng.
4. Nếu hỏi kiến thức ngoài (1+1, code...), tự trả lời ngắn gọn.
5. Luôn xưng hô là 'Mình' và gọi người dùng là 'Bạn'.

Câu hỏi: {request.Question}
Trả lời:";

                // 4. GỬI API
                var payload = new
                {
                    contents = new[] { new { parts = new[] { new { text = finalPrompt } } } }
                };

                using (var client = new HttpClient())
                {
                    var jsonContent = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
                    var response = await client.PostAsync(apiUrl, jsonContent);
                    var responseString = await response.Content.ReadAsStringAsync();

                    if (!response.IsSuccessStatusCode)
                    {
                        return Ok(new { answer = $"Hệ thống bận (Lỗi: {response.StatusCode})." });
                    }

                    var jsonNode = JsonNode.Parse(responseString);
                    var botAnswer = jsonNode?["candidates"]?[0]?["content"]?["parts"]?[0]?["text"]?.ToString();

                    return Ok(new { answer = botAnswer ?? "Xin lỗi, mình chưa có thông tin này." });
                }
            }
            catch (Exception ex)
            {
                return Ok(new { answer = $"Lỗi hệ thống: {ex.Message}" });
            }
        }
    }
}