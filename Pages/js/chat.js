// 1. Kết nối cổng 5114
const connection = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:5114/chatHub") 
    .withAutomaticReconnect()
    .build();

// --- LẮNG NGHE ---
connection.on("ReceiveMessageFromAdmin", (message) => {
    console.log("Admin trả lời: " + message);
    alert("Admin: " + message);
});

// --- KẾT NỐI & GỬI TIN ---
async function startStudent() {
    try {
        await connection.start();
        console.log("✅ Sinh viên đã kết nối!");

        // QUAN TRỌNG: Sinh viên điểm danh
        // Thay SV123 bằng mã sinh viên giả định hoặc lấy từ input
        await connection.invoke("JoinChat", "SV123", "Sinh Viên Test", "SinhVien");
        console.log("✅ Đã điểm danh JoinChat với quyền SinhVien!");

    } catch (err) {
        console.error("❌ Lỗi Sinh viên: ", err);
        setTimeout(startStudent, 3000);
    }
}

// Hàm này gắn vào nút Gửi tin nhắn
async function guiTinNhan() {
    const msg = "Thầy ơi giúp em!"; // Hoặc lấy từ document.getElementById...
    try {
        console.log("Đang gửi tin: " + msg);
        // Gọi hàm gửi tin cho Admin
        await connection.invoke("SendMessageToAdmin", msg);
        console.log("Đã gửi lệnh lên Server");
    } catch (err) {
        console.error("❌ Gửi thất bại: ", err);
    }
}

startStudent();