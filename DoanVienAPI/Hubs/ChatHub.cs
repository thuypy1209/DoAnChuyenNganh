using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;
using System.Threading.Tasks;
using System.Linq;
using System.Collections.Generic;

namespace DoanVienAPI.Hubs
{
    public class ChatHub : Hub
    {
        // Lưu danh sách người dùng đang online (Key: ConnectionId, Value: UserInfo)
        private static readonly ConcurrentDictionary<string, UserInfo> _users = new ConcurrentDictionary<string, UserInfo>();

        public override Task OnConnectedAsync()
        {
            // Khi có người kết nối, chưa làm gì vội, đợi họ gửi info
            return base.OnConnectedAsync();
        }

        public override Task OnDisconnectedAsync(Exception? exception)
        {
            // Khi ngắt kết nối -> Xóa khỏi danh sách và báo cho Admin
            if (_users.TryRemove(Context.ConnectionId, out UserInfo user))
            {
                // Báo cho Admin cập nhật lại danh sách (nếu cần)
            }
            return base.OnDisconnectedAsync(exception);
        }

        // Hàm 1: Đăng ký thông tin (Sinh viên/Admin gọi hàm này ngay khi kết nối)
        public async Task JoinChat(string userId, string userName, string role)
        {
            var user = new UserInfo { ConnectionId = Context.ConnectionId, UserId = userId, UserName = userName, Role = role };
            _users.TryAdd(Context.ConnectionId, user);

            if (role == "SinhVien")
            {
                // Báo cho Admin biết có SV mới online để hiện lên danh sách
                await Clients.Group("AdminGroup").SendAsync("UserConnected", userId, userName);
            }
            else if (role == "Admin")
            {
                // Nếu là Admin -> Add vào nhóm Admin để nhận thông báo
                await Groups.AddToGroupAsync(Context.ConnectionId, "AdminGroup");
            }
        }

        // Hàm 2: Gửi tin nhắn (Sửa lại logic gửi riêng)
        public async Task SendMessageToAdmin(string message)
        {
            // SV gửi tin cho Admin -> Lấy thông tin SV gửi
            if (_users.TryGetValue(Context.ConnectionId, out UserInfo sender))
            {
                // Gửi cho nhóm Admin, kèm theo ID người gửi để Admin biết ai nhắn
                await Clients.Group("AdminGroup").SendAsync("ReceiveMessageFromUser", sender.UserId, sender.UserName, message);
            }
        }

        // Hàm 3: Admin trả lời riêng cho 1 SV
        public async Task SendMessageToUser(string userId, string message)
        {
            // Tìm connectionId của User đó (đang online)
            var targetConnection = _users.Values.FirstOrDefault(u => u.UserId == userId);

            if (targetConnection != null)
            {
                // Gửi riêng cho người đó
                await Clients.Client(targetConnection.ConnectionId).SendAsync("ReceiveMessageFromAdmin", message);
            }
        }
    }

    public class UserInfo
    {
        public string ConnectionId { get; set; }
        public string UserId { get; set; } // MSSV hoặc 'Admin'
        public string UserName { get; set; }
        public string Role { get; set; } // 'SinhVien' hoặc 'Admin'
    }
}