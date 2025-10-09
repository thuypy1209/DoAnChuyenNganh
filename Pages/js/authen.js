// Hàm đăng nhập
async function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const message = document.getElementById('message');

    try {
        const res = await fetch('http://localhost:5114/api/Account/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ Username: username, Password: password })
        });

        if (res.ok) {
            const data = await res.json();
            localStorage.setItem('token', data.token);
            message.style.color = 'green';
            message.innerText = 'Đăng nhập thành công!';
            setTimeout(() => window.location.href = '../dashbroad.html', 1000);
        } else {
            const error = await res.text();
            message.style.color = 'red';
            message.innerText = 'Sai tên đăng nhập hoặc mật khẩu.\n' + error;
        }
    } catch (err) {
        message.style.color = 'red';
        message.innerText = 'Lỗi kết nối đến server.';
    }
}

function togglePassword(event) {
    const btn = event.currentTarget;
    // Tìm input liên quan gần nhất (cùng nhóm hoặc cùng cha)
    let passwordInput = btn.previousElementSibling;
    // Nếu không tìm thấy, fallback về id cũ
    if (!passwordInput || passwordInput.tagName !== 'INPUT') {
        passwordInput = document.getElementById('password');
    }
    if (!passwordInput) return;

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        btn.textContent = '🙈';
    } else {
        passwordInput.type = 'password';
        btn.textContent = '👁';
    }
}

// Kiểm tra nếu đã đăng nhập ở trang login/register thì chuyển hướng sang profile
document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('token');
    const isLoginPage = window.location.pathname.toLowerCase().includes('login');
    const isRegisterPage = window.location.pathname.toLowerCase().includes('register');
    if (token && (isLoginPage || isRegisterPage)) {
        window.location.href = 'profile.html';
    }
});

// Đăng ký
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const fullName = this.querySelector('input[name="fullName"]').value.trim();
        const username = this.querySelector('input[name="username"]').value.trim().toLowerCase();
        const email = this.querySelector('input[name="email"]').value.trim();
        const password = this.querySelector('input[name="password"]').value;
        const confirmPassword = this.querySelector('input[name="confirmPassword"]').value;
        const role = this.querySelector('select[name="role"]').value;
        const message = document.getElementById('message');

        if (!fullName || !username) {
            message.innerText = 'Vui lòng điền đầy đủ họ tên và tên đăng nhập.';
            return;
        }
        if (!/^[a-zA-Z0-9]+$/.test(username)) {
            message.innerText = 'Tên đăng nhập chỉ được chứa chữ cái và số.';
            return;
        }
        if (password !== confirmPassword) {
            message.innerText = 'Mật khẩu không khớp. Vui lòng kiểm tra lại.';
            return;
        }
        if (!role) {
            message.innerText = 'Vui lòng chọn loại tài khoản.';
            return;
        }

        fetch('http://localhost:5114/api/Account/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                FullName: fullName,
                Username: username,
                Email: email,
                Password: password,
                ConfirmPassword: confirmPassword,
                Role: role
            })
        })
            .then(async response => {
                const data = await response.json();
                if (response.ok) {
                    alert('Đăng ký thành công! Bạn có thể đăng nhập.');
                    window.location.href = 'login.html';
                } else {
                    message.innerText = data.message || (data.errors ? data.errors.join('; ') : 'Đăng ký thất bại.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                message.innerText = 'Đã xảy ra lỗi. Vui lòng thử lại.';
            });
    });
}

// Hàm đăng xuất
function logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}

// Hiển thị thông tin profile nếu có phần tử profileContent
document.addEventListener('DOMContentLoaded', function () {
    const profileContainer = document.getElementById('profileContent');
    if (!profileContainer) return;

    const token = localStorage.getItem('token');
    if (!token) {
        profileContainer.innerHTML = `<p class="text-danger">Bạn chưa đăng nhập!</p>`;
        setTimeout(() => window.location.href = 'login.html', 1500);
        return;
    }

    fetch('http://localhost:5114/api/Account/profile', {
        headers: { 'Authorization': 'Bearer ' + token }
    })
        .then(async response => {
            if (response.ok) {
                const data = await response.json();
                if (typeof data === 'string') {
                    profileContainer.innerHTML = `<p><strong>Mã người dùng:</strong> ${data}</p>`;
                } else {
                    profileContainer.innerHTML = `
                        <p><strong>Tên đăng nhập:</strong> ${data.UserName || ''}</p>
                        <p><strong>Email:</strong> ${data.Email || ''}</p>
                        <p><strong>Vai trò:</strong> ${data.Role || ''}</p>
                    `;
                }
            } else if (response.status === 401) {
                profileContainer.innerHTML = `<p class="text-danger">Bạn chưa đăng nhập hoặc token hết hạn.</p>`;
                setTimeout(() => window.location.href = 'login.html', 1500);
            } else {
                profileContainer.innerHTML = `<p class="text-danger">Không thể tải thông tin người dùng.</p>`;
            }
        })
        .catch(error => {
            console.error('Profile fetch error:', error);
            profileContainer.innerHTML = `<p class="text-danger">Lỗi kết nối đến server.</p>`;
        });
});
// Hàm đổi mật khẩu
document.getElementById('changeForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const currentPassword = this.oldPassword.value;
    const newPassword = this.newPassword.value;
    const confirmNewPassword = this.confirmNewPassword.value;

    if (newPassword !== confirmNewPassword) {
        document.getElementById('message').innerText = 'Mật khẩu mới không khớp.';
        return;
    }

    // Lấy token từ localStorage
    const token = localStorage.getItem('token');
    if (!token) {
        document.getElementById('message').innerText = 'Bạn chưa đăng nhập!';
        setTimeout(() => window.location.href = 'login.html', 1500);
        return;
    }

    fetch('http://localhost:5114/api/Account/changepassword', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ CurrentPassword: currentPassword, NewPassword: newPassword, ConfirmPassword: confirmNewPassword })
    })
        .then(response => response.json().then(data => ({ ok: response.ok, data })))
        .then(result => {
            // Log để kiểm tra dữ liệu trả về từ backend
            console.log(result.data);

            if (result.ok) {
                localStorage.removeItem('token');
                alert('Đổi mật khẩu thành công. Vui lòng đăng nhập lại.');
                window.location.href = 'login.html';
            } else {
                // Hiển thị tất cả lỗi trả về từ backend
                let msg = result.data.message || 'Lỗi đổi mật khẩu.';
                if (result.data.errors && Array.isArray(result.data.errors)) {
                    msg += '\n' + result.data.errors.join('\n');
                }
                document.getElementById('message').innerText = msg;
            }
        })
        .catch(error => {
            console.error('Lỗi:', error);
            document.getElementById('message').innerText = 'Đã xảy ra lỗi. Vui lòng thử lại.';
        });

});
