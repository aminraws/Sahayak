(function () {
    const form = document.getElementById("registerForm");
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

    function validateRegistrationForm(formData) {
        const { name, email, phone, password, role } = formData;

        if (!name || !email || !phone || !password || !role) {
            throw new Error("Please complete all fields before creating your account.");
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
            throw new Error("Please enter a valid email address.");
        }

        if (password.length < 6) {
            throw new Error("Password must be at least 6 characters long.");
        }

        if (!["customer", "worker"].includes(role)) {
            throw new Error("Please select a valid role.");
        }
    }

    async function handleRegisterSubmit(event) {
        event.preventDefault();

        if (!form) {
            return;
        }

        const formData = {
            name: (document.getElementById("name")?.value || "").trim(),
            email: (document.getElementById("email")?.value || "").trim(),
            phone: (document.getElementById("phone")?.value || "").trim(),
            password: (document.getElementById("password")?.value || "").trim(),
            role: (document.getElementById("role")?.value || "").trim(),
        };

        try {
            validateRegistrationForm(formData);
            showMessage("", "success");

            const response = await fetch(`${API_URL}/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(result?.message || result?.error || "Registration failed. Please try again.");
            }

            showMessage(result?.message || "Registration successful.", "success");

            window.setTimeout(() => {
                window.location.href = "login.html";
            }, 1200);
        } catch (error) {
            console.error("Registration failed:", error);
            showMessage(error.message || "Unable to create your account right now.", "error");
        }
    }

    if (form) {
        form.addEventListener("submit", handleRegisterSubmit);
    }
})();
