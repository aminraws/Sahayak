(function () {
    const greeting = document.getElementById("workerGreeting");
    const earningsValue = document.getElementById("totalEarningsValue");
    const earningsNote = document.getElementById("totalEarningsNote");
    const jobsValue = document.getElementById("activeJobsValue");
    const jobsNote = document.getElementById("activeJobsNote");
    const ratingValue = document.getElementById("ratingValue");
    const ratingNote = document.getElementById("ratingNote");
    const completedValue = document.getElementById("completedValue");
    const completedNote = document.getElementById("completedNote");
    const jobList = document.getElementById("jobsList");
    const profileCard = document.getElementById("workerProfileCard");

    function formatCurrency(value) {
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

    function formatTime(value) {
        return value || "Time not available";
    }

    function getStatusClass(status) {
        const normalized = (status || "pending").toLowerCase();
        if (normalized === "accepted") {
            return "confirmed";
        }
        if (normalized === "completed") {
            return "confirmed";
        }
        return "pending";
    }

    function safeName(value, fallback = "Worker") {
        return value && String(value).trim() ? value : fallback;
    }

    function renderJobs(bookings) {
        if (!jobList) {
            return;
        }

        if (!Array.isArray(bookings) || !bookings.length) {
            jobList.innerHTML = `
                <div class="job">
                    <div class="job-details">
                        <h3>No bookings yet</h3>
                        <p>You have no active service requests right now.</p>
                    </div>
                </div>
            `;
            return;
        }

        const visibleBookings = bookings.slice(0, 3);

        jobList.innerHTML = visibleBookings.map((booking) => {
            const customerName = booking.customer?.name || "Customer";
            const statusText = booking.status === "accepted" ? "Confirmed" : booking.status === "pending" ? "Upcoming" : booking.status === "completed" ? "Completed" : "Pending";
            const dateText = formatDate(booking.date);
            const timeText = formatTime(booking.time);
            const address = booking.address || "Address not provided";

            return `
                <div class="job">
                    <div class="job-time">
                        <strong>${timeText.split(":")[0] || "09"}</strong>
                        <span>${timeText.includes("AM") ? "AM" : timeText.includes("PM") ? "PM" : ""}</span>
                    </div>
                    <div class="job-details">
                        <h3>${booking.service || "Service"}</h3>
                        <p>${customerName}</p>
                        <span class="job-location">⌖ ${address}</span>
                        <small>${dateText}</small>
                    </div>
                    <div class="job-right">
                        <span class="${getStatusClass(booking.status)}">${statusText}</span>
                        <a href="job-request.html?id=${booking._id}">View Job →</a>
                    </div>
                </div>
            `;
        }).join("");
    }

    function renderProfile(worker) {
        if (!profileCard) {
            return;
        }

        const user = worker?.user || {};
        const name = safeName(user.name || worker?.name || "Worker");
        const service = Array.isArray(worker?.skills) && worker.skills.length ? worker.skills.join(", ") : "Service provider";
        const experience = worker?.experience != null ? `${worker.experience} years` : "Experience not set";
        const initials = name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "W";

        profileCard.innerHTML = `
            <p class="card-label">YOUR PROFILE</p>
            <div class="profile-top">
                <div class="profile-avatar">${initials}</div>
                <div>
                    <h2>${name}</h2>
                    <p>★ 4.9 · Verified</p>
                </div>
            </div>
            <div class="profile-service">
                <span>SERVICE</span>
                <strong>${service}</strong>
            </div>
            <div class="profile-service">
                <span>EXPERIENCE</span>
                <strong>${experience}</strong>
            </div>
            <div class="profile-line"></div>
            <a href="profile-setup.html" class="profile-button">View Profile →</a>
        `;
    }

    async function loadDashboard() {
        try {
            const [authResponse, workerResponse, statsResponse, bookingsResponse] = await Promise.all([
                fetch(`${API_URL}/auth/profile`, {
                    headers: SahayakAuth.getAuthHeaders(false)
                }),
                fetch(`${API_URL}/workers/profile`, {
                    headers: SahayakAuth.getAuthHeaders(false)
                }),
                fetch(`${API_URL}/bookings/dashboard/worker`, {
                    headers: SahayakAuth.getAuthHeaders(false)
                }),
                fetch(`${API_URL}/bookings/worker`, {
                    headers: SahayakAuth.getAuthHeaders(false)
                })
            ]);

            const authResult = await authResponse.json().catch(() => ({}));
            const workerResult = await workerResponse.json().catch(() => ({}));
            const statsResult = await statsResponse.json().catch(() => ({}));
            const bookingsResult = await bookingsResponse.json().catch(() => ({}));

            if (!authResponse.ok) {
                throw new Error(authResult?.message || "Unable to load profile.");
            }

            if (!workerResponse.ok && workerResult?.message !== "Worker profile not found") {
                throw new Error(workerResult?.message || "Unable to load worker profile.");
            }

            const userName = authResult?.user?.name || "Worker";
            const worker = workerResult?.worker || {};
            const stats = statsResult || {};
            const bookings = Array.isArray(bookingsResult?.bookings) ? bookingsResult.bookings : [];

            if (greeting) {
                const firstName = userName.split(" ")[0] || userName;
                greeting.innerHTML = `Good morning, <span>${firstName}.</span>`;
            }

            if (earningsValue) {
                earningsValue.textContent = formatCurrency(stats.totalEarnings || 0);
            }
            if (earningsNote) {
                earningsNote.textContent = `${(stats.totalReviews || 0)} reviews in this period`;
            }
            if (jobsValue) {
                jobsValue.textContent = Number((stats.stats?.accepted || 0) + (stats.stats?.pending || 0));
            }
            if (jobsNote) {
                jobsNote.textContent = `${stats.stats?.pending || 0} pending · ${stats.stats?.accepted || 0} confirmed`;
            }
            if (ratingValue) {
                ratingValue.textContent = Number(stats.averageRating || 0).toFixed(1);
            }
            if (ratingNote) {
                ratingNote.textContent = `Based on ${stats.totalReviews || 0} reviews`;
            }
            if (completedValue) {
                completedValue.textContent = stats.stats?.completed || 0;
            }
            if (completedNote) {
                completedNote.textContent = "Jobs completed";
            }

            renderProfile(worker);
            renderJobs(bookings);
        } catch (error) {
            console.error("Error loading worker dashboard:", error);
            if (jobList) {
                jobList.innerHTML = `
                    <div class="job">
                        <div class="job-details">
                            <h3>Unable to load jobs</h3>
                            <p>${error.message || "Please try again later."}</p>
                        </div>
                    </div>
                `;
            }
        }
    }

    loadDashboard();
})();
