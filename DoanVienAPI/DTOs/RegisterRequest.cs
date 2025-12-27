public class RegisterRequest
{
    public string Email { get; set; }
    public string Password { get; set; }
    public string FullName { get; set; }

    // Thêm mấy cái này vào để nhận từ form đăng ký
    public string Mssv { get; set; }
    public string Lop { get; set; }
    public string Khoa { get; set; }
}