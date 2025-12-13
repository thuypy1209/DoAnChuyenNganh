using Microsoft.AspNetCore.Mvc;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;

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
                // 1. ĐỌC DỮ LIỆU TỪ FILE TXT (Thay vì viết cứng trong code)
                // File data.txt phải được set "Copy to Output Directory" là "Copy if newer"
                string filePath = Path.Combine(Directory.GetCurrentDirectory(), "data.txt");

                if (!System.IO.File.Exists(filePath))
                {
                    return Ok(new { answer = "Lỗi Server: Không tìm thấy file dữ liệu (data.txt)." });
                }

                string knowledgeBase = await System.IO.File.ReadAllTextAsync(filePath);

                // 2. Cấu hình Gemini
                var apiKey = _configuration["Gemini:ApiKey"];
                string modelName = "gemini-2.5-flash";
                string apiUrl = $"https://generativelanguage.googleapis.com/v1beta/models/{modelName}:generateContent?key={apiKey}";

                // 3. Ghép dữ liệu vào Prompt
                string finalPrompt = knowledgeBase + $"\n\nCâu hỏi của sinh viên: {request.Question}\nTrả lời ngắn gọn, thân thiện:";

                // 4. Gửi lên Google
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
                        return Ok(new { answer = $"Hệ thống đang bảo trì (Lỗi API: {response.StatusCode})." });
                    }

                    var jsonNode = JsonNode.Parse(responseString);
                    var botAnswer = jsonNode?["candidates"]?[0]?["content"]?["parts"]?[0]?["text"]?.ToString();

                    return Ok(new { answer = botAnswer ?? "Xin lỗi, mình chưa tìm thấy thông tin này." });
                }
            }
            catch (Exception ex)
            {
                return Ok(new { answer = $"Lỗi hệ thống: {ex.Message}" });
            }
        }
    }
}