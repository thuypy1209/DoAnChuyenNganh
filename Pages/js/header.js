function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch((err) => {
            alert(`Error attempting to enable full-screen mode: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
}


function parseJwt(token) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    if (token) {
        const payload = parseJwt(token);
        if (payload && payload.email) {
            document.getElementById("userName").textContent = payload.email;
        } else {
            document.getElementById("userName").textContent = "Khách";
            console.warn("Token không hợp lệ hoặc không chứa email.");
        }
    } else {
        document.getElementById("userName").textContent = "Khách";
    }
});
function toggleDropdown() {
  const dropdown = document.getElementById('dropdownMenu');
  dropdown.classList.toggle('hidden');
}
function togglelogout() {
    if (confirm("Bạn có chắc muốn đăng xuất?")) {
        localStorage.removeItem("token");
        window.location.href = "../Pages/account/login.html";
    }
}
function toggleSeTtings() {
    // Chuyển hướng sang trang setting.html khi bấm nút cài đặt
    window.location.href = "../Pages/setting.html";
}
