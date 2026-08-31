(function () {
    function getAuthToken() {
        return localStorage.getItem("token") || "";
    }

    function getUserRole() {
        return localStorage.getItem("role") || localStorage.getItem("userRole") || "";
    }

    function getAuthHeaders(includeJson = true) {
        const headers = {
            Authorization: `Bearer ${getAuthToken()}`
        };

        if (includeJson) {
            headers["Content-Type"] = "application/json";
        }

        return headers;
    }

    function redirectToLogin() {
        window.location.href = "login.html";
    }

    function redirectToDashboardByRole() {
        const role = getUserRole();

        if (role === "worker") {
            window.location.href = "worker-dashboard.html";
            return;
        }

        if (role === "customer") {
            window.location.href = "customer-dashboard.html";
            return;
        }

        window.location.href = "home.html";
    }

    function protectWorkerPage() {
        const token = getAuthToken();
        const role = getUserRole();

        if (!token || role !== "worker") {
            redirectToLogin();
        }
    }

    function protectCustomerPage() {
        const token = getAuthToken();
        const role = getUserRole();

        if (!token || role !== "customer") {
            redirectToLogin();
        }
    }

    function setupLogout() {
        document.querySelectorAll("[data-logout]").forEach((logoutElement) => {
            logoutElement.addEventListener("click", () => {
                localStorage.removeItem("token");
                localStorage.removeItem("role");
                localStorage.removeItem("userRole");
                localStorage.removeItem("selectedWorkerId");
                redirectToLogin();
            });
        });
    }

    window.SahayakAuth = {
        getAuthToken,
        getUserRole,
        getAuthHeaders,
        redirectToLogin,
        redirectToDashboardByRole,
        protectWorkerPage,
        protectCustomerPage,
        setupLogout
    };
})();
