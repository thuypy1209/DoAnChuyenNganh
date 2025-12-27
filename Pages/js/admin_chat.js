// 1. Kết nối vào cổng 5114 (Theo log của em)
const connection = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:5114/chatHub", {
        accessTokenFactory: () => localStorage.getItem("token") || "" // Lấy token nếu có
    })
    .withAutomaticReconnect()
    .build();

// --- LẮNG NGHE ---
connection.on("ReceiveMessageFromUser", (userId, userName, message) => {
    console.log(`📩 TIN MỚI: ${userName}: ${message}`);
    alert(`📩 ${userName} nhắn: ${message}`);
    // Em viết code append HTML vào khung chat ở đây
});

connection.on("UserConnected", (userId, userName) => {
    console.log(`🟢 Sinh viên ${userName} vừa online`);
});

// --- KẾT NỐI & ĐIỂM DANH ---
async function startAdmin() {
    try {
        await connection.start();
        console.log("✅ Admin đã kết nối SignalR thành công!");

        // QUAN TRỌNG NHẤT: Phải báo danh là Admin
        // Code cũ của em có thể thiếu đoạn này hoặc sai tham số
        await connection.invoke("JoinChat", "ADMIN01", "Admin Việt", "Admin");
        console.log("✅ Đã điểm danh JoinChat với quyền Admin!");

    } catch (err) {
        console.error("❌ Lỗi Admin: ", err);
        setTimeout(startAdmin, 3000);
    }
}

startAdmin();