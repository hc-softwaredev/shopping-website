document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const role = document.getElementById("role").value;

    const result = mockApi.login(email, password, role);

    if (!result.success) {
        showToast(result.message, "error");
        return;
    }

    showToast("Login successful!", "success");

    // Redirect
    setTimeout(() => {
        if (role === "recruiter") {
            window.location.href = "recruiter_dashboard.html";
        } else {
            window.location.href = "student-dashboard.html";
        }
    }, 1000);
});
