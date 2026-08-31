(function () {
    const workerName = document.getElementById("earningsWorkerName");
    const totalEarnings = document.getElementById("totalEarningsValue");
    const completedJobs = document.getElementById("completedJobsValue");
    const averagePerJob = document.getElementById("averagePerJobValue");
    const reviewSummary = document.getElementById("reviewSummaryValue");
    const reviewCount = document.getElementById("reviewCountValue");
    const earningsBars = document.getElementById("earningsBars");
    const reviewsList = document.getElementById("reviewsList");

    function formatCurrency(value) {
        return `₹${Number(value || 0).toLocaleString("en-IN")}`;
    }

    function formatDate(dateValue) {
        if (!dateValue) {
            return "Recently";
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

    function renderBars(bookings) {
        if (!earningsBars) {
            return;
        }

        const weeklyTotals = [0, 0, 0, 0];
        bookings.forEach((booking) => {
            if (booking.status !== "completed") {
                return;
            }
            const index = Math.min(3, Math.max(0, Math.floor((new Date(booking.date).getTime() / (1000 * 60 * 60 * 24 * 7)) % 4)));
            weeklyTotals[index] += Number(booking.totalAmount || 0);
        });

        const max = Math.max(...weeklyTotals, 1);
        earningsBars.innerHTML = weeklyTotals.map((amount, index) => {
            const height = Math.max(18, (amount / max) * 100);
            return `
                <div class="bar-column">
                    <div class="bar" style="height: ${height}%"></div>
                    <span>Week ${index + 1}</span>
                </div>
            `;
        }).join("");
    }

    function renderReviews(reviews) {
        if (!reviewsList) {
            return;
        }

        if (!Array.isArray(reviews) || !reviews.length) {
            reviewsList.innerHTML = `
                <article class="review-card">
                    <p class="review-text">No customer reviews yet. Complete a few jobs to start building trust.</p>
                </article>
            `;
            return;
        }

        reviewsList.innerHTML = reviews.map((review) => {
            const customerNameValue = review.customer?.name || "Customer";
            const stars = Array.from({ length: 5 }, (_, index) => index < Number(review.rating || 0) ? "★" : "☆").join("");
            return `
                <article class="review-card">
                    <div class="review-top">
                        <div class="review-person">
                            <div class="review-avatar">${customerNameValue.charAt(0).toUpperCase()}</div>
                            <div>
                                <h3>${customerNameValue}</h3>
                                <p>${formatDate(review.createdAt)}</p>
                            </div>
                        </div>
                        <span class="review-stars">${stars}</span>
                    </div>
                    <p class="review-text">${review.comment || "Great experience."}</p>
                </article>
            `;
        }).join("");
    }

    async function loadFinancialData() {
        try {
            const [profileResponse, earningsResponse, reviewsResponse] = await Promise.all([
                fetch(`${API_URL}/auth/profile`, {
                    headers: SahayakAuth.getAuthHeaders(false)
                }),
                fetch(`${API_URL}/earnings`, {
                    headers: SahayakAuth.getAuthHeaders(false)
                }),
                fetch(`${API_URL}/workers/profile`, {
                    headers: SahayakAuth.getAuthHeaders(false)
                })
            ]);

            const profileResult = await profileResponse.json().catch(() => ({}));
            const earningsResult = await earningsResponse.json().catch(() => ({}));
            const workerResult = await reviewsResponse.json().catch(() => ({}));

            if (!profileResponse.ok) {
                throw new Error(profileResult?.message || "Unable to load profile.");
            }

            const userName = profileResult.user?.name || "Worker";
            if (workerName) {
                workerName.textContent = userName;
            }

            const totalValue = Number(earningsResult?.totalEarnings || 0);
            if (totalEarnings) {
                totalEarnings.textContent = formatCurrency(totalValue);
            }
            if (completedJobs) {
                completedJobs.textContent = earningsResult?.completedBookings || 0;
            }
            if (averagePerJob) {
                const average = (earningsResult?.completedBookings || 0) ? totalValue / (earningsResult.completedBookings || 1) : 0;
                averagePerJob.textContent = formatCurrency(average);
            }

            const workerId = workerResult?.worker?._id;
            if (!workerId) {
                if (reviewSummary) reviewSummary.textContent = "0.0";
                if (reviewCount) reviewCount.textContent = "0 reviews";
                renderBars([]);
                renderReviews([]);
                return;
            }

            const reviewResponse = await fetch(`${API_URL}/reviews/worker/${workerId}`);
            const reviewResult = await reviewResponse.json().catch(() => ({}));

            if (!reviewResponse.ok) {
                throw new Error(reviewResult?.message || "Unable to load reviews.");
            }

            const reviews = Array.isArray(reviewResult?.reviews) ? reviewResult.reviews : [];
            const averageRating = Number(reviewResult?.averageRating || 0);
            if (reviewSummary) {
                reviewSummary.textContent = averageRating.toFixed(1);
            }
            if (reviewCount) {
                reviewCount.textContent = `${reviewResult?.totalReviews || 0} reviews`;
            }

            renderBars(earningsResult?.bookings || []);
            renderReviews(reviews);
        } catch (error) {
            console.error("Error loading earnings and reviews:", error);
            if (totalEarnings) {
                totalEarnings.textContent = "₹0";
            }
            if (reviewsList) {
                reviewsList.innerHTML = `<article class="review-card"><p class="review-text">${error.message || "Unable to load reviews right now."}</p></article>`;
            }
        }
    }

    loadFinancialData();
})();
