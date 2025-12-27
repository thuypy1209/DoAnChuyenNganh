using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;

namespace DoanVienAPI.Hubs
{
    public class ChatHub : Hub
    {
        // Sử dụng ConcurrentDictionary để quản lý danh sách online an toàn giữa các luồng
        // Key: ConnectionId, Value: UserInfo
        private static readonly ConcurrentDictionary<string, UserInfo> _users = new ConcurrentDictionary<string, UserInfo>();

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            // Khi người dùng thoát, xóa ConnectionId khỏi danh sách
            if (_users.TryRemove(Context.ConnectionId, out UserInfo user))
            {
                // Kiểm tra xem User này còn Connection nào khác không (trường hợp mở nhiều tab)
                bool isStillOnline = _users.Values.Any(u => u.UserId == user.UserId);

                if (!isStillOnline)
                {
                    // Nếu đã thoát hết các tab, báo cho Admin để cập nhật giao diện (xám màu chẳng hạn)
                    await Clients.Group("AdminGroup").SendAsync("UserDisconnected", user.UserId);
                }
            }
            await base.OnDisconnectedAsync(exception);
        }

        // Hàm 1: Đăng ký định danh - Gọi ngay sau khi connection.start() ở Front-end
        public async Task JoinChat(string userId, string userName, string role)
        {
            var user = new UserInfo
            {
                ConnectionId = Context.ConnectionId,
                UserId = userId,
                UserName = userName,
                Role = role
            };

            // Lưu hoặc cập nhật thông tin kết nối
            _users.AddOrUpdate(Context.ConnectionId, user, (key, old) => user);

            if (role == "SinhVien")
            {
                // Báo cho toàn bộ Admin đang online biết có SV mới vào
                await Clients.Group("AdminGroup").SendAsync("UserConnected", userId, userName);
            }
            else if (role == "Admin")
            {
                // Cho Admin vào nhóm riêng để nhận tin nhắn từ mọi SV
                await Groups.AddToGroupAsync(Context.ConnectionId, "AdminGroup");

                // Gửi danh sách các SV đang online hiện tại cho Admin vừa mới kết nối
                var onlineStudents = _users.Values
                    .Where(u => u.Role == "SinhVien")
                    .Select(u => new { u.UserId, u.UserName })
                    .DistinctBy(u => u.UserId)
                    .ToList();

                await Clients.Caller.SendAsync("UpdateOnlineList", onlineStudents);
            }
        }

        // Hàm 2: Sinh viên gửi tin nhắn lên cho Admin
        public async Task SendMessageToAdmin(string message)
        {
            if (_users.TryGetValue(Context.ConnectionId, out UserInfo sender))
            {
                // Kiểm tra xem có Admin nào đang trực không
                bool isAdminOnline = _users.Values.Any(u => u.Role == "Admin");

                if (!isAdminOnline)
                {
                    // Nếu không có Admin, báo lại cho SV biết
                    await Clients.Caller.SendAsync("ReceiveMessageFromAdmin", "Hiện tại không có hỗ trợ viên trực tuyến. Tin nhắn của bạn đã được ghi lại.");
                }

                // Gửi tin nhắn kèm thông tin người gửi cho nhóm Admin
                await Clients.Group("AdminGroup").SendAsync("ReceiveMessageFromUser", sender.UserId, sender.UserName, message);
            }
        }

        // Hàm 3: Admin trả lời riêng cho một sinh viên cụ thể (theo MSSV)
        public async Task SendMessageToUser(string userId, string message)
        {
            // Tìm tất cả các kết nối của sinh viên này (đề phòng mở nhiều tab)
            var targetConnections = _users.Values.Where(u => u.UserId == userId).Select(u => u.ConnectionId).ToList();

            if (targetConnections.Any())
            {
                // Gửi tin nhắn đến tất cả các tab mà sinh viên đang mở
                await Clients.Clients(targetConnections).SendAsync("ReceiveMessageFromAdmin", message);
            }
        }
    }

    public class UserInfo
    {
        public string ConnectionId { get; set; }
        public string UserId { get; set; } // MSSV
        public string UserName { get; set; } // Họ tên thật
        public string Role { get; set; } // "SinhVien" hoặc "Admin"
    }
}