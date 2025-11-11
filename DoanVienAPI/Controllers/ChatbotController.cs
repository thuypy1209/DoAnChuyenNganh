using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System;
using System.Threading.Tasks;
using GenerativeAI;

// XÓA CÁC LỚP MÔ HÌNH GeminiPart, GeminiRequest... nếu bạn chưa xóa
// Chỉ giữ lại AskRequest
public class AskRequest
{
    public string? Question { get; set; }
}

[ApiController]
[Route("api/[controller]")]
public class ChatbotController : ControllerBase
{
    // Sử dụng SDK của Google.Ai.GenerativeAI
    private readonly GenerativeModel _model;

    // CONSTRUCTOR: Lấy API Key từ cấu hình (appsettings.json)
    public ChatbotController(IConfiguration configuration)
    {
        // 1. Lấy API Key từ cấu hình (Đã sửa lỗi logic)
        var apiKey = configuration["Gemini:ApiKey"]
                  ?? throw new InvalidOperationException("Gemini API Key is missing in configuration (appsettings.json).");

        // 2. Khởi tạo model AI
        // SDK sẽ xử lý việc gọi API cho chúng ta
        _model = new GenerativeModel(apiKey, "gemini-1.5-flash");
    }

    [HttpPost("ask")]
    public async Task<IActionResult> Ask([FromBody] AskRequest request)
    {
        if (string.IsNullOrEmpty(request.Question))
        {
            return BadRequest(new { answer = "Câu hỏi không được để trống." });
        }

        try
        {
            // GỌI API GEMINI BẰNG SDK (ĐƠN GIẢN HƠN RẤT NHIỀU!)
            var response = await _model.GenerateContentAsync(request.Question);

            var botResponse = response.Text
                              ?? "Xin lỗi, tôi không nhận được câu trả lời từ AI.";

            // Trả về câu trả lời
            return Ok(new { answer = botResponse });
        }
        catch (Exception ex)
        {
            // Xử lý lỗi: Trả về lỗi 500 kèm thông báo chi tiết
            return StatusCode(500, new { answer = $"Lỗi hệ thống AI: {ex.Message}" });
        }
    }
}