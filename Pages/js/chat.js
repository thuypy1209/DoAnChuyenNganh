// File: js/chat.js

const MSSV_CURRENT = "2280603664"; // Lấy từ Session đăng nhập thực tế
const NAME_CURRENT = "Lương Quốc Việt"; // Lấy từ Session

const connection = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:5114/chatHub")
    .withAutomaticReconnect() // Tự động kết nối lại nếu rớt mạng
    .build();

// --- 1. NHẬN TIN NHẮN TỪ ADMIN ---
connection.on("ReceiveMessageFromAdmin", function (message) {
    const msgBox = document.getElementById("chatMessages");
    
    // Hiện tin nhắn Admin (bên Trái)
    const div = document.createElement("div");
    div.className = "text-left mb-3 animate-fade-in";
    div.innerHTML = `
        <div class="flex items-end gap-2">
            <div class="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-[10px]"><i class="fas fa-headset"></i></div>
            <div class="inline-block px-4 py-2 rounded-2xl rounded-bl-none bg-gray-100 text-gray-800 text-sm shadow-sm max-w-[75%] break-words">
                ${message}
            </div>
        </div>
        <p class="text-[10px] text-gray-400 ml-9 mt-1">Hỗ trợ viên</p>
    `;
    msgBox.appendChild(div);
    msgBox.scrollTop = msgBox.scrollHeight;

    // Rung chuông/Báo đỏ nếu đang đóng chat
    const chatBox = document.getElementById("chatBox");
    if (chatBox.classList.contains("hidden")) {
        // Code hiện chấm đỏ thông báo ở đây (nếu cần)
    }
});

// --- 2. KẾT NỐI VÀ ĐĂNG KÝ ---
async function start() {
    try {
        await connection.start();
        console.log("Connected!");
        // QUAN TRỌNG: Gửi thông tin định danh lên Server
        await connection.invoke("JoinChat", MSSV_CURRENT, NAME_CURRENT, "SinhVien");
    } catch (err) {
        console.error(err);
        setTimeout(start, 5000); // Thử lại sau 5s
    }
}

start();

// --- 3. GỬI TIN NHẮN ---
function sendMessage() {
    const input = document.getElementById("chatInput");
    const message = input.value;
    
    if(message.trim() !== "") {
        // Hiện tin nhắn của mình lên trước (bên Phải)
        const msgBox = document.getElementById("chatMessages");
        const div = document.createElement("div");
        div.className = "text-right mb-3 animate-fade-in";
        div.innerHTML = `
             <div class="inline-block px-4 py-2 rounded-2xl rounded-br-none bg-blue-600 text-white text-sm shadow-sm text-left max-w-[80%] break-words">
                ${message}
            </div>
        `;
        msgBox.appendChild(div);
        msgBox.scrollTop = msgBox.scrollHeight;

        // Gửi lên Server
        connection.invoke("SendMessageToAdmin", message).catch(err => console.error(err));
        input.value = "";
        input.focus();
    }
}
// ... (Các phần xử lý UI giữ nguyên)