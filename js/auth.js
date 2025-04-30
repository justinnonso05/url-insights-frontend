document.addEventListener("DOMContentLoaded", function () {
    const loginTab = document.getElementById("login-tab");
    const registerTab = document.getElementById("register-tab");
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");
    const errorContainer = document.getElementById("error-container");
    const errorMessage = document.getElementById("error-message");
    const successContainer = document.getElementById("success-container");
    const successMessage = document.getElementById("success-message");

    const BASE_URL = "http://localhost:8000"; // FastAPI backend URL
    
    function showError(message) {
        errorMessage.textContent = message;
        errorContainer.classList.remove("hidden");
        setTimeout(() => errorContainer.classList.add("hidden"), 3000);
    }

    function showSuccess(message) {
        successMessage.textContent = message;
        successContainer.classList.remove("hidden");
        setTimeout(() => successContainer.classList.add("hidden"), 3000);
    }

    loginTab.addEventListener("click", () => {
        loginForm.classList.remove("hidden");
        registerForm.classList.add("hidden");
        loginTab.classList.add("active");
        registerTab.classList.remove("active");
    });

    registerTab.addEventListener("click", () => {
        registerForm.classList.remove("hidden");
        loginForm.classList.add("hidden");
        registerTab.classList.add("active");
        loginTab.classList.remove("active");
    });

    document.querySelectorAll(".toggle-password").forEach(button => {
        button.addEventListener("click", function () {
            const input = this.previousElementSibling;
            input.type = input.type === "password" ? "text" : "password";
        });
    });

    loginForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;

        try {
            const response = await fetch(`${BASE_URL}/users/login/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("access_token", data.access_token);
                showSuccess("Login successful!");
                window.location.href = "https://url-insights.vercel.app/";
            } else {
                showError(data.detail || "Invalid email or password.");
            }
        } catch (error) {
            showError("Network error. Please try again.");
        }
    });

    registerForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        const email = document.getElementById("register-email").value;
        const password = document.getElementById("register-password").value;
        const confirmPassword = document.getElementById("confirm-password").value;

        if (password !== confirmPassword) {
            showError("Passwords do not match.");
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/users/register/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();

            if (response.ok) {
                showSuccess("Registration successful! You can now log in.");
                setTimeout(() => loginTab.click(), 2000);
            } else {
                showError(data.detail || "Registration failed.");
            }
        } catch (error) {
            showError("Network error. Please try again.");
        }
    });
});
