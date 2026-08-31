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
    return value == null || value === "" ? fallback : value;
}

function createWorkerCard(worker) {
    const card = document.createElement("div");
    card.className = "worker-card";

    const userName = getDisplayValue(worker?.user?.name, "Professional");
    const skills = getSafeArray(worker?.skills);
    const experience = worker?.experience != null ? `${worker.experience} years experience` : "Experience not available";
    const location = getDisplayValue(worker?.location, "Location not available");
    const hourlyRate = worker?.hourlyRate != null ? `₹${worker.hourlyRate}` : "Rate not available";
    const workerId = worker?._id ? worker._id : "";
    const skillsText = skills.length ? skills.join(", ") : "Professional";
    const skillTags = skills.length
        ? skills.map(skill => `<span>${escapeHtml(skill)}</span>`).join("")
        : "";

    card.innerHTML = `
        <div class="worker-photo">👤</div>

        <div class="worker-info">
            <div class="name-row">
                <h2>${escapeHtml(userName)}</h2>
                <span class="verified">✓ Verified</span>
            </div>

            <p class="role">${escapeHtml(skillsText)}</p>

            <div class="stats">
                <span>${escapeHtml(experience)}</span>
                <span>${escapeHtml(location)}</span>
            </div>

            <div class="tags">${skillTags}</div>
        </div>

        <div class="worker-price">
            <small>STARTING FROM</small>
            <strong>${escapeHtml(hourlyRate)}</strong>
            <a href="worker-profile.html?id=${encodeURIComponent(workerId)}">View Profile →</a>
        </div>
    `;

    const profileLink = card.querySelector("a");
    if (profileLink && workerId) {
        profileLink.addEventListener("click", () => {
            localStorage.setItem("selectedWorkerId", worker._id);
            console.log("Saving selected worker ID:", worker._id);
        });
    }

    return card;
}

async function loadWorkers() {
    const container = document.getElementById("workersContainer");

    if (!container) {
        console.error("Workers container not found.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/workers`);

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const data = await response.json();
        const workers = Array.isArray(data?.workers) ? data.workers : [];

        container.innerHTML = "";

        if (!workers.length) {
            container.innerHTML = `
                <div class="worker-card">
                    <div class="worker-info">
                        <p class="role">No professionals available right now.</p>
                    </div>
                </div>
            `;
            return;
        }

        workers.forEach(worker => {
            if (worker && typeof worker === "object") {
                container.appendChild(createWorkerCard(worker));
            }
        });
    } catch (error) {
        console.error("Error loading workers:", error);
        container.innerHTML = `
            <div class="worker-card">
                <div class="worker-info">
                    <p class="role">Unable to load professionals right now. Please try again later.</p>
                </div>
            </div>
        `;
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadWorkers);
} else {
    loadWorkers();
}