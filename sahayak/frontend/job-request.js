(function () {
    const params = new URLSearchParams(window.location.search);
    const bookingId = params.get("id") || localStorage.getItem("selectedBookingId");
    const requestCard = document.getElementById("requestCard");
    const requestStatus = document.getElementById("requestStatus");
    const requestTitle = document.getElementById("requestTitle");
    const requestSubtitle = document.getElementById("requestSubtitle");
    const requestPrice = document.getElementById("requestPrice");
    const customerName = document.getElementById("customerName");
    const customerRating = document.getElementById("customerRating");
    const dateValue = document.getElementById("dateValue");
    const timeValue = document.getElementById("timeValue");
    const addressValue = document.getElementById("addressValue");
    const addressLabel = document.getElementById("addressLabel");
    const instructions = document.getElementById("instructionsText");
    const summaryService = document.getElementById("summaryService");
    const summaryDuration = document.getElementById("summaryDuration");
    const summaryDistance = document.getElementById("summaryDistance");
    const summaryEarnings = document.getElementById("summaryEarnings");
    const acceptButton = document.getElementById("acceptJobButton");
    const declineButton = document.getElementById("declineJobButton");

    function formatCurrency(value) {
        return `₹${Number(value || 0).toLocaleString("en-IN")}`;
    }

    function formatDate(dateValueText) {
        if (!dateValueText) {
            return "Date not available";
        }
        const date = new Date(dateValueText);
        if (Number.isNaN(date.getTime())) {
            return dateValueText;
        }
        return new Intl.DateTimeFormat("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }).format(date);
    }

    function updateActionButtons() {
        if (!acceptButton || !declineButton) {
            return;
        }

        acceptButton.addEventListener("click", async () => {
            await updateBookingStatus("accepted");
        });

        declineButton.addEventListener("click", async () => {
            await updateBookingStatus("rejected");
        });
    }

    async function updateBookingStatus(status) {
        if (!bookingId) {
            window.alert("Booking not found.");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/bookings/${bookingId}/status`, {
                method: "PATCH",
                headers: SahayakAuth.getAuthHeaders(false),
                body: JSON.stringify({ status })
            });

            const result = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(result?.message || "Unable to update booking status.");
            }

            window.location.href = "worker-dashboard.html";
        } catch (error) {
            console.error("Booking status update failed:", error);
            window.alert(error.message || "Unable to update booking status right now.");
        }
    }

    async function loadBooking() {
        if (!bookingId) {
            if (requestCard) {
                requestCard.innerHTML = "<p class='detail-label'>Booking not selected.</p>";
            }
            return;
        }

        try {
            const response = await fetch(`${API_URL}/bookings/${bookingId}`, {
                headers: SahayakAuth.getAuthHeaders(false)
            });

            const result = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(result?.message || "Booking could not be loaded.");
            }

            const booking = result?.booking;
            if (!booking) {
                throw new Error("Booking not found.");
            }

            localStorage.setItem("selectedBookingId", bookingId);

            const customer = booking.customer || {};
            const worker = booking.worker || {};
            const user = worker.user || {};

            if (requestStatus) {
                requestStatus.textContent = (booking.status || "pending").toUpperCase();
            }
            if (requestTitle) {
                requestTitle.textContent = booking.service || "Service";
            }
            if (requestSubtitle) {
                requestSubtitle.textContent = `Service request for ${user.name || "worker"}`;
            }
            if (requestPrice) {
                requestPrice.textContent = formatCurrency(booking.totalAmount || 0);
            }
            if (customerName) {
                customerName.textContent = customer.name || "Customer";
            }
            if (customerRating) {
                customerRating.textContent = `★ ${customer.rating || 4.8} customer rating`;
            }
            if (dateValue) {
                dateValue.textContent = formatDate(booking.date);
            }
            if (timeValue) {
                timeValue.textContent = booking.time || "Time not available";
            }
            if (addressLabel) {
                addressLabel.textContent = customer.name ? `${customer.name}'s Home` : "Service address";
            }
            if (addressValue) {
                addressValue.textContent = booking.address || "Address not available";
            }
            if (instructions) {
                instructions.textContent = booking.description || "No specific instructions provided.";
            }
            if (summaryService) {
                summaryService.textContent = booking.service || "Service";
            }
            if (summaryDuration) {
                summaryDuration.textContent = "2 hours";
            }
            if (summaryDistance) {
                summaryDistance.textContent = "3.2 km";
            }
            if (summaryEarnings) {
                summaryEarnings.textContent = formatCurrency(booking.totalAmount || 0);
            }
        } catch (error) {
            console.error("Error loading booking request:", error);
            if (requestCard) {
                requestCard.innerHTML = `<div class="detail-section"><p class="detail-label">Booking unavailable</p><p>${error.message || "Unable to load booking."}</p></div>`;
            }
        }
    }

    updateActionButtons();
    loadBooking();
})();
