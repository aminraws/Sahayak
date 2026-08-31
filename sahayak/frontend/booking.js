(function () {
    function showBookingMessage(message, type = "error") {
        const messageBox = document.getElementById("bookingMessage");

        if (!messageBox) {
            return;
        }

        messageBox.textContent = message;
        messageBox.style.display = "block";
        messageBox.style.padding = "12px 16px";
        messageBox.style.marginBottom = "16px";
        messageBox.style.borderRadius = "12px";
        messageBox.style.fontWeight = "600";
        messageBox.style.lineHeight = "1.5";
        messageBox.style.background = type === "success" ? "#edfdf3" : "#fff4f4";
        messageBox.style.border = type === "success" ? "1px solid #bde7c8" : "1px solid #f3d5d4";
        messageBox.style.color = type === "success" ? "#1d7a4d" : "#a42b2b";
    }

    function clearBookingMessage() {
        const messageBox = document.getElementById("bookingMessage");

        if (!messageBox) {
            return;
        }

        messageBox.textContent = "";
        messageBox.style.display = "none";
    }

    function findTextValue(selectors) {
        for (const selector of selectors) {
            const element = document.querySelector(selector);
            const value = element ? element.textContent.trim() : "";

            if (value) {
                return value;
            }
        }

        return "";
    }

    function parseAmount(rawValue) {
        if (!rawValue) {
            return null;
        }

        const match = String(rawValue).match(/-?\d+(?:\.\d+)?/);

        if (!match) {
            return null;
        }

        const number = Number(match[0]);
        return Number.isFinite(number) ? number : null;
    }

    function parseBookingDate(rawValue) {
        if (!rawValue) {
            return "";
        }

        const trimmed = String(rawValue).trim();

        if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
            return trimmed;
        }

        const parsedDate = new Date(trimmed);

        if (Number.isNaN(parsedDate.getTime())) {
            return "";
        }

        return parsedDate.toISOString().split("T")[0];
    }

    function formatDisplayDate(dateString) {
        if (!dateString) {
            return "";
        }

        const [year, month, day] = dateString.split("-").map(Number);
        const parsedDate = new Date(year, month - 1, day);

        if (Number.isNaN(parsedDate.getTime())) {
            return dateString;
        }

        return new Intl.DateTimeFormat("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }).format(parsedDate);
    }

    let selectedDate = "";
    let selectedTime = "";

    function normalizeWorkerId(value) {
        if (value == null) {
            return "";
        }

        if (typeof value === "string") {
            return value.trim();
        }

        if (typeof value === "object") {
            return normalizeWorkerId(value._id || value.id);
        }

        return String(value).trim();
    }

    function persistSelectedWorkerId(workerId) {
        const normalizedWorkerId = normalizeWorkerId(workerId);

        if (!normalizedWorkerId) {
            return "";
        }

        localStorage.setItem("selectedWorkerId", normalizedWorkerId);
        return normalizedWorkerId;
    }

    function getSelectedWorkerId() {
        const params = new URLSearchParams(window.location.search);
        const workerIdFromQuery = params.get("workerId") || params.get("id");
        const workerIdFromStorage = localStorage.getItem("selectedWorkerId");
        const workerId = persistSelectedWorkerId(workerIdFromQuery || workerIdFromStorage || "");

        return workerId || normalizeWorkerId(workerIdFromStorage || "");
    }

    async function loadSelectedWorker() {
        const workerId = getSelectedWorkerId();

        if (!workerId) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/workers/${workerId}`);

            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }

            const data = await response.json();
            const worker = data && typeof data === "object" ? data.worker : null;

            if (!worker) {
                return;
            }

            persistSelectedWorkerId(worker._id || worker.id || workerId);

            const workerName = worker?.user?.name || worker?.name || "Selected Worker";
            const workerNameElement = document.querySelector(".summary .professional strong");

            if (workerNameElement) {
                workerNameElement.textContent = workerName;
            }
        } catch (error) {
            console.error("Error loading selected worker details:", error);
        }
    }

    function updateSelectedSummary() {
        const dateSummary = document.querySelector(".summary .summary-row:first-of-type strong");
        const timeSummary = document.querySelector(".summary .summary-row:nth-of-type(2) strong");

        if (dateSummary && selectedDate) {
            dateSummary.textContent = formatDisplayDate(selectedDate);
        }

        if (timeSummary && selectedTime) {
            timeSummary.textContent = selectedTime;
        }
    }

    function initializeSelectionState() {
        selectedDate = document.querySelector(".dates .selected")?.dataset.date || "";
        selectedTime = document.querySelector(".times .selected")?.dataset.time || "";
        updateSelectedSummary();

        document.querySelectorAll(".dates div").forEach((dateOption) => {
            dateOption.addEventListener("click", () => {
                document.querySelectorAll(".dates div").forEach((date) => date.classList.remove("selected"));
                dateOption.classList.add("selected");
                selectedDate = dateOption.dataset.date || "";
                updateSelectedSummary();
            });
        });

        document.querySelectorAll(".times button").forEach((timeOption) => {
            timeOption.addEventListener("click", () => {
                document.querySelectorAll(".times button").forEach((time) => time.classList.remove("selected"));
                timeOption.classList.add("selected");
                selectedTime = timeOption.dataset.time || "";
                updateSelectedSummary();
            });
        });
    }

    async function findCustomerDashboardPage() {
        const candidates = [
            "customer-dashboard.html",
            "my-bookings.html",
            "customer-bookings.html",
            "bookings.html"
        ];

        for (const page of candidates) {
            try {
                const response = await fetch(page, { method: "HEAD" });

                if (response.ok) {
                    return page;
                }
            } catch (error) {
                // Ignore missing pages and continue checking the next candidate.
            }
        }

        return "customer-dashboard.html";
    }

    function getBookingData() {
        const workerId = getSelectedWorkerId();
        const service = findTextValue([
            ".summary h2",
            ".book-card small",
            ".profession"
        ]);
        const dateText = selectedDate || findTextValue([
            ".summary .summary-row:first-of-type strong",
            ".dates .selected strong"
        ]);
        const timeText = selectedTime || document.querySelector(".times .selected")?.dataset.time || "";
        const addressPrimary = document.querySelector(".address strong")?.textContent.trim() || "";
        const addressSecondary = document.querySelector(".address p")?.textContent.trim() || "";
        const address = [addressPrimary, addressSecondary].filter(Boolean).join(", ").replace(/\s+/g, " ").trim();
        const description = document.querySelector("textarea")?.value.trim() || "";
        const totalAmount = parseAmount(findTextValue([
            ".total strong",
            ".book-card h2"
        ]));

        return {
            workerId: persistSelectedWorkerId(workerId),
            service,
            dateText,
            timeText,
            address,
            description,
            totalAmount
        };
    }

    function validateBookingData(data) {
        const token = localStorage.getItem("token");

        if (!data.workerId) {
            throw new Error("No worker was selected for this booking.");
        }

        if (!token) {
            throw new Error("Please log in as a customer before booking a service.");
        }

        if (!data.service) {
            throw new Error("The service name is missing. Please try again.");
        }

        const parsedDate = parseBookingDate(data.dateText);

        if (!parsedDate) {
            throw new Error("Please select a valid booking date.");
        }

        if (!data.timeText) {
            throw new Error("Please select a valid booking time.");
        }

        if (!data.address) {
            throw new Error("Please add the service address before confirming the booking.");
        }

        if (data.totalAmount === null || Number.isNaN(data.totalAmount) || data.totalAmount <= 0) {
            throw new Error("The booking total is missing or invalid.");
        }

        return {
            ...data,
            date: parsedDate,
            time: data.timeText,
            totalAmount: data.totalAmount
        };
    }

    async function submitBooking(event) {
        event.preventDefault();
        clearBookingMessage();

        try {
            const workerId = localStorage.getItem("selectedWorkerId");

            if (!workerId) {
                showBookingMessage("No worker was selected. Please choose a worker before booking.", "error");
                return;
            }

            const bookingData = validateBookingData(getBookingData());
            const token = localStorage.getItem("token");
            const persistedWorkerId = persistSelectedWorkerId(bookingData.workerId || workerId);
            const payload = {
                worker: persistedWorkerId,
                service: bookingData.service,
                date: bookingData.date,
                time: bookingData.time,
                address: bookingData.address,
                description: bookingData.description,
                totalAmount: bookingData.totalAmount
            };

            console.log("Selected worker ID:", persistedWorkerId);
            console.log("Booking payload:", payload);

            const response = await fetch(`${API_URL}/bookings`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(result?.message || `Booking failed (${response.status}). Please try again.`);
            }

            showBookingMessage(result?.message || "Booking created successfully.", "success");

            const dashboardPage = await findCustomerDashboardPage();

            if (dashboardPage) {
                setTimeout(() => {
                    window.location.href = dashboardPage;
                }, 1500);
            }
        } catch (error) {
            console.error("Booking submission failed:", error);
            showBookingMessage(
                error.message || "Unable to create the booking right now. Please try again later.",
                "error"
            );
        }
    }

    const bookingForm = document.getElementById("bookingForm");

    if (bookingForm) {
        initializeSelectionState();
        bookingForm.addEventListener("submit", submitBooking);
    }
})();
