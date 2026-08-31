(function () {
    const form = document.getElementById("profileSetupForm");
    const messageBox = document.getElementById("profileMessage");
    const serviceField = document.getElementById("service");
    const experienceField = document.getElementById("experience");
    const locationField = document.getElementById("location");
    const hourlyRateField = document.getElementById("hourlyRate");
    const aboutField = document.getElementById("about");
    const submitButton = document.getElementById("profileSubmitButton");

    function showMessage(message, type = "error") {
        if (!messageBox) {
            return;
        }
        messageBox.textContent = message;
        messageBox.className = `auth-message ${type}`;
    }

    async function populateExistingProfile() {
        try {
            const response = await fetch(`${API_URL}/workers/profile`, {
                headers: SahayakAuth.getAuthHeaders(false)
            });

            if (!response.ok) {
                return;
            }

            const result = await response.json().catch(() => ({}));
            const worker = result?.worker;

            if (!worker) {
                return;
            }

            if (serviceField) {
                serviceField.value = Array.isArray(worker.skills) && worker.skills.length ? worker.skills[0] : "";
            }
            if (experienceField) {
                experienceField.value = worker.experience || "";
            }
            if (locationField) {
                locationField.value = worker.location || "";
            }
            if (hourlyRateField) {
                hourlyRateField.value = worker.hourlyRate || "";
            }
            if (aboutField) {
                aboutField.value = worker.description || "";
            }

            showMessage("Your worker profile is already set up. Redirecting to the dashboard...", "success");
            if (submitButton) {
                submitButton.textContent = "Profile ready";
                submitButton.disabled = true;
            }
            window.setTimeout(() => {
                window.location.href = "worker-dashboard.html";
            }, 1000);
        } catch (error) {
            console.error("Error checking worker profile:", error);
        }
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const payload = {
            skills: serviceField && serviceField.value ? [serviceField.value] : [],
            experience: Number(experienceField?.value || 0),
            location: (locationField?.value || "").trim(),
            hourlyRate: Number(hourlyRateField?.value || 0),
            description: (aboutField?.value || "").trim()
        };

        if (!payload.skills.length || !payload.location || !payload.description || !payload.hourlyRate || !payload.experience) {
            showMessage("Please complete every field before continuing.", "error");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/workers/profile`, {
                method: "POST",
                headers: SahayakAuth.getAuthHeaders(false),
                body: JSON.stringify(payload)
            });

            const result = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(result?.message || "Unable to create your worker profile.");
            }

            showMessage(result?.message || "Worker profile saved successfully.", "success");
            window.setTimeout(() => {
                window.location.href = "verification.html";
            }, 1000);
        } catch (error) {
            console.error("Profile creation failed:", error);
            showMessage(error.message || "Unable to save your worker profile.", "error");
        }
    }

    if (form) {
        form.addEventListener("submit", handleSubmit);
    }

    SahayakAuth.protectWorkerPage();
    populateExistingProfile();
})();
