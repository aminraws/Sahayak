(function () {
    const bookingList = document.getElementById("bookingList");
    const customerGreeting = document.getElementById("customerGreeting");
    const customerName = document.getElementById("customerName");
    const customerEmail = document.getElementById("customerEmail");
    const customerPhone = document.getElementById("customerPhone");

    function formatMoney(value) {
        return `₹${Number(value || 0).toLocaleString("en-IN")}`;
    }

    function formatDate(dateValue) {
        if (!dateValue) {
            return "Date not available";
        }

        const date = new Date(dateValue);
        if (Number.isNaN(date.getTime())) {
            return dateValue;
        }

        return new Intl.DateTimeFormat("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }).format(date);
    }

    function formatStatus(status) {
        const normalized = (status || "pending").toLowerCase();
        const labels = {
            pending: "Pending",
            accepted: "Confirmed",
            completed: "Completed",
            rejected: "Rejected",
            cancelled: "Cancelled"
        };
        return labels[normalized] || "Pending";
    }

    function statusClass(status) {
        const normalized = (status || "pending").toLowerCase();
        return normalized === "accepted" ? "confirmed" : normalized === "completed" ? "confirmed" : normalized === "cancelled" ? "pending" : "pending";
    }

    function renderBookings(bookings) {
        if (!bookingList) {
            return;
        }

        if (!Array.isArray(bookings) || !bookings.length) {
            bookingList.innerHTML = `
                <div class="job">
                    <div class="job-details">
                        <h3>No bookings yet</h3>
                        <p>Start by booking a service from the professionals list.</p>
                    </div>
                </div>
            `;
            return;
        }

        bookingList.innerHTML = bookings.map((booking) => {
            const workerName = booking.worker?.user?.name || booking.worker?.name || "Professional";
            const service = booking.service || "Service";
            const statusLabel = formatStatus(booking.status);
            const amount = formatMoney(booking.totalAmount);
            const address = booking.address || "Address not provided";
            const dateText = formatDate(booking.date);
            const timeText = booking.time || "Time not available";
            const button = (booking.status === "pending" || booking.status === "accepted")
                ? `<button type="button" class="cancel-booking" data-booking-id="${booking._id}">Cancel booking</button>`
                : `<span class="job-right"><span class="${statusClass(booking.status)}">${statusLabel}</span></span>`;

            return `
                <div class="job">
                    <div class="job-time">
                        <strong>${timeText.split(":")[0] || "09"}</strong>
                        <span>${timeText.includes("AM") || timeText.includes("PM") ? (timeText.includes("AM") ? "AM" : "PM") : ""}</span>
                    </div>
                    <div class="job-details">
                        <h3>${service}</h3>
                        <p>${workerName}</p>
                        <span class="job-location">⌖ ${address}</span>
                        <small>${dateText}</small>
                    </div>
                    <div class="job-right">
                        <span class="${statusClass(booking.status)}">${statusLabel}</span>
                        <strong>${amount}</strong>
                        ${button}
                    </div>
                </div>
            `;
        }).join("");

        bookingList.querySelectorAll(".cancel-booking").forEach((button) => {
            button.addEventListener("click", async () => {
                const bookingId = button.dataset.bookingId;
                if (!bookingId) {
                    return;
                }

                try {
                    const response = await fetch(`${API_URL}/bookings/${bookingId}/cancel`, {
                        method: "PATCH",
                        headers: SahayakAuth.getAuthHeaders(false),
                    });

                    const result = await response.json().catch(() => ({}));
                    if (!response.ok) {
                        throw new Error(result?.message || "Unable to cancel this booking.");
                    }

                    window.location.reload();
                } catch (error) {
                    console.error("Booking cancellation failed:", error);
                    window.alert(error.message || "Unable to cancel booking right now.");
                }
            });
        });
    }

    async function loadDashboard() {
        try {
            const [profileResponse, statsResponse, bookingsResponse] = await Promise.all([
                fetch(`${API_URL}/auth/profile`, {
                    headers: SahayakAuth.getAuthHeaders(false)
                }),
                fetch(`${API_URL}/bookings/dashboard/customer`, {
                    headers: SahayakAuth.getAuthHeaders(false)
                }),
                fetch(`${API_URL}/bookings/my`, {
                    headers: SahayakAuth.getAuthHeaders(false)
                })
            ]);

            const profileResult = await profileResponse.json().catch(() => ({}));
            const statsResult = await statsResponse.json().catch(() => ({}));
            const bookingsResult = await bookingsResponse.json().catch(() => ({}));

            if (!profileResponse.ok) {
                throw new Error(profileResult?.message || "Unable to load your profile.");
            }

            const user = profileResult.user || {};
            const name = user.name || "Customer";
            const firstName = name.split(" ")[0];

            if (customerGreeting) {
                customerGreeting.textContent = firstName;
            }
            if (customerName) {
                customerName.textContent = name;
            }
            if (customerEmail) {
                customerEmail.textContent = user.email || "Not available";
            }
            if (customerPhone) {
                customerPhone.textContent = user.phone || "Not available";
            }

            const stats = statsResult?.stats || {};
            document.getElementById("totalBookingsValue").textContent = stats.total || 0;
            document.getElementById("pendingBookingsValue").textContent = stats.pending || 0;
            document.getElementById("acceptedBookingsValue").textContent = stats.accepted || 0;
            document.getElementById("completedBookingsValue").textContent = stats.completed || 0;

            renderBookings(bookingsResult?.bookings || []);
        } catch (error) {
            console.error("Error loading customer dashboard:", error);
            if (bookingList) {
                bookingList.innerHTML = `
                    <div class="job">
                        <div class="job-details">
                            <h3>Unable to load bookings</h3>
                            <p>${error.message || "Please try again later."}</p>
                        </div>
                    </div>
                `;
            }
        }
    }

    loadDashboard();
})();
