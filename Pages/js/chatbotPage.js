// File: js/chatbotPage.js (PHIÊN BẢN SỬA LỖI HOÀN CHỈNH)

document.addEventListener('DOMContentLoaded', function () {
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const chatMessages = document.getElementById('chat-messages');
    const suggestionBtns = document.querySelectorAll('.suggestion-btn');
    const welcomeScreen = document.getElementById('welcome-screen');

    function addMessage(message, sender) {
        if (welcomeScreen && !welcomeScreen.classList.contains('hidden')) {
            welcomeScreen.classList.add('hidden');
        }
        const messageDiv = document.createElement('div');
        messageDiv.className = 'w-full mb-4 flex';
        if (sender === 'user') {
            messageDiv.classList.add('justify-end');
            messageDiv.innerHTML = `<div class="bg-blue-500 text-white rounded-lg p-3 max-w-lg">${message}</div>`;
        } else {
            messageDiv.classList.add('justify-start');
            messageDiv.innerHTML = `<div class="bg-white text-gray-800 rounded-lg p-3 max-w-lg shadow-sm border">${message}</div>`;
        }
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async function findAnswer(userQuestion) {
        try {
            const response = await fetch('https://localhost:7006/api/chatbot/ask', { // ⚠️ THAY ĐÚNG SỐ CỔNG CỦA BẠN
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ Question: userQuestion }),
            });
            if (!response.ok) { return "Huhu, có vẻ 'tổng đài' AI đang bận. Bạn thử lại sau nhé!"; }
            const data = await response.json();
            return data.answer;
        } catch (error) {
            console.error("Lỗi kết nối đến Back-end:", error);
            return "Ối, hình như 'dây điện thoại' đến Back-end bị đứt rồi! Bạn kiểm tra xem Back-end đã chạy chưa nhé.";
        }
    }

    async function handleSendMessage() { // THÊM 'async'
        const question = chatInput.value.trim();
        if (question === "") return;

        addMessage(question, 'user');
        chatInput.value = "";
        sendBtn.disabled = true;
        chatInput.style.height = 'auto';

        // Hiển thị hiệu ứng "bot đang gõ"
        addMessage("...", 'bot');
        const allBotMessages = chatMessages.querySelectorAll('.justify-start');
        const lastBotMessageBubble = allBotMessages[allBotMessages.length - 1].querySelector('div');
        
        // CHỜ để lấy câu trả lời thật
        const answer = await findAnswer(question); // THÊM 'await'

        // Cập nhật bong bóng chat cuối cùng với câu trả lời thật
        lastBotMessageBubble.textContent = answer;
    }

    sendBtn.addEventListener('click', handleSendMessage);
    chatInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSendMessage();
        }
    });
    suggestionBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            chatInput.value = this.textContent;
            handleSendMessage();
        });
    });
    chatInput.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
        sendBtn.disabled = this.value.trim() === "";
    });
});