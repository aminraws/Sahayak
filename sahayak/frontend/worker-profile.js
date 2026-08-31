(function () {
    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function getSafeArray(value) {
        return Array.isArray(value) ? value.filter(item => item != null && item !== "") : [];
    }

    function getDisplayValue(value, fallback = "Not available") {
        return value == null || value === "" ? fallback : String(value);
    }

    function showError(message) {
        const main = document.querySelector("main");

        if (!main) {
            console.error(message);
            return;
        }

        main.innerHTML = `
            <div style="max-width: 760px; margin: 40px auto; padding: 24px; border-radius: 12px; background: #fff4f4; border: 1px solid #f3c9c3; color: #a42b2b; font-family: 'DM Sans', sans-serif; line-height: 1.6; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.04);">
                ${escapeHtml(message)}
            </div>
        `;
    }

    function populateWorkerProfile(worker) {
        if (!worker || typeof worker !== "object") {
            showError("The worker details could not be loaded.");
            return;
        }

        const user = worker.user || {};
        const name = getDisplayValue(user.name || user.email || "Worker", "Worker");
        const skills = getSafeArray(worker.skills);
        const description = getDisplayValue(worker.description, "No description provided yet.");
        const location = getDisplayValue(worker.location, "Location not available");
        const experience = worker.experience != null ? Number(worker.experience) : null;
        const hourlyRate = worker.hourlyRate != null ? Number(worker.hourlyRate) : null;
        const workerId = worker._id || "";

        const breadcrumb = document.querySelector(".breadcrumb");
        if (breadcrumb) {
            const breadcrumbSpans = breadcrumb.querySelectorAll("span");
            const lastSpan = breadcrumbSpans[breadcrumbSpans.length - 1];
            if (lastSpan) {
                lastSpan.textContent = name;
            }
        }

        const profileName = document.querySelector(".profile-info h1");
        if (profileName) {
            profileName.textContent = name;
        }

        const profession = document.querySelector(".profession");
        if (profession) {
            profession.textContent = skills.length ? skills.join(", ") : "Professional";
        }

        const descriptionText = document.querySelector(".description");
        if (descriptionText) {
            descriptionText.textContent = description;
        }

        const statBlocks = document.querySelectorAll(".stats > div");
        if (statBlocks.length >= 3) {
            const experienceBlock = statBlocks[0];
            const experienceStrong = experienceBlock.querySelector("strong");
            const experienceLabel = experienceBlock.querySelector("span");

            if (experienceStrong) {
                experienceStrong.textContent = experience != null ? `${experience}+` : "N/A";
            }

            if (experienceLabel) {
                experienceLabel.textContent = experience != null ? (experience === 1 ? "Year experience" : "Years experience") : "Experience";
            }

            const locationBlock = statBlocks[1];
            const locationStrong = locationBlock.querySelector("strong");
            const locationLabel = locationBlock.querySelector("span");

            if (locationStrong) {
                locationStrong.textContent = location;
            }

            if (locationLabel) {
                locationLabel.textContent = "Location";
            }

            const rateBlock = statBlocks[2];
            const rateStrong = rateBlock.querySelector("strong");
            const rateLabel = rateBlock.querySelector("span");

            if (rateStrong) {
                rateStrong.textContent = hourlyRate != null ? `₹${hourlyRate}` : "N/A";
            }

            if (rateLabel) {
                rateLabel.textContent = "Hourly rate";
            }
        }

        const bookCard = document.querySelector(".book-card");
        if (bookCard) {
            const category = bookCard.querySelector("small");
            if (category) {
                category.textContent = skills.length ? skills[0].toUpperCase() : "SERVICE";
            }

            const price = bookCard.querySelector("h2");
            if (price) {
                price.textContent = hourlyRate != null ? `₹${hourlyRate}` : "₹0";
            }

            const bookingLink = bookCard.querySelector("a");
            if (bookingLink) {
                if (worker._id) {
                    localStorage.setItem("selectedWorkerId", worker._id);
                    console.log("Saving selected worker ID:", worker._id);
                }

                bookingLink.addEventListener("click", () => {
                    if (worker._id) {
                        localStorage.setItem("selectedWorkerId", worker._id);
                        console.log("Saving selected worker ID:", worker._id);
                    }
                });

                bookingLink.href = `booking.html?workerId=${encodeURIComponent(worker._id || workerId)}`;
                bookingLink.textContent = `Book ${name} →`;
            }
        }

        const aboutText = document.querySelector(".about-text");
        if (aboutText) {
            aboutText.textContent = description;
        }

        const servicesContainer = document.querySelector(".services");
        if (servicesContainer) {
            if (skills.length) {
                servicesContainer.innerHTML = skills.map(skill => `<div>✓ ${escapeHtml(skill)}</div>`).join("");
            } else {
                servicesContainer.innerHTML = "<div>✓ No skills listed</div>";
            }
        }

        const pageTitle = document.title;
        if (pageTitle && pageTitle.includes("Sahayak - Worker Profile")) {
            document.title = `${name} | Sahayak`;
        }
    }

    async function loadWorkerProfile() {
        const params = new URLSearchParams(window.location.search);
        const workerId = params.get("id");

        if (!workerId) {
            showError("Worker ID is missing. Please select a worker from the professionals list.");
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
                throw new Error("Worker profile not found.");
            }

            populateWorkerProfile(worker);
        } catch (error) {
            console.error("Error loading worker profile:", error);
            showError("Unable to load this worker profile right now. Please try again later.");
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", loadWorkerProfile);
    } else {
        loadWorkerProfile();
    }
})();
