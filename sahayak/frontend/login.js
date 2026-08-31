(function () {
    const form = document.getElementById("loginForm");
    const messageBox = document.getElementById("authMessage");

    function showMessage(message, type = "error") {
        if (!messageBox) {
            return;
        }

        if (!message) {
            messageBox.textContent = "";
            messageBox.className = "auth-message";
            return;
        }

        messageBox.textContent = message;
        messageBox.className = `auth-message ${type}`;
    }

    function validateLoginForm(email, password) {
        if (!email || !password) {
            throw new Error("Please enter both your email and password.");
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
            throw new Error("Please enter a valid email address.");
        }
    }

    async function handleLoginSubmit(event) {
        event.preventDefault();

        if (!form) {
            return;
        }

        const email = (document.getElementById("email")?.value || "").trim();
        const password = (document.getElementById("password")?.value || "").trim();

        try {
            validateLoginForm(email, password);
            showMessage("", "success");

            const response = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const result = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(result?.message || result?.error || "Login failed. Please try again.");
            }

            const token = result?.token;

            if (!token) {
                throw new Error("Login response did not include an authentication token.");
            }

            localStorage.setItem("token", token);

            const userRole = result?.user?.role;

            if (!userRole) {
                throw new Error("Login response did not include a user role.");
            }

            localStorage.setItem("role", userRole);
            localStorage.setItem("userRole", userRole);

            showMessage(result?.message || "Login successful.", "success");

            window.setTimeout(() => {
                window.location.href = userRole === "worker"
                    ? "worker-dashboard.html"
                    : "customer-dashboard.html";
            }, 800);
        } catch (error) {
            console.error("Login failed:", error);
            showMessage(error.message || "Unable to login right now. Please try again later.", "error");
        }
    }

    if (form) {
        form.addEventListener("submit", handleLoginSubmit);
    }
})();
