(function () {
    SahayakAuth.protectWorkerPage();

    const idTypeField = document.getElementById("id-type");
    const idNumberField = document.getElementById("id-number");
    const frontIdField = document.getElementById("frontId");
    const backIdField = document.getElementById("backId");
    const confirmationField = document.getElementById("confirm");
    const submitButton = document.getElementById("submitVerification") ||
        document.querySelector(".continue-btn");
    const fileFields = document.querySelectorAll('input[type="file"]');
    const frontFileField = frontIdField || fileFields[0];
    const backFileField = backIdField || fileFields[1];
    let isSubmitting = false;

    async function handleSubmit(event) {
        event.preventDefault();

        if (isSubmitting) {
            return;
        }

        const idType = idTypeField ? idTypeField.value.trim() : "";
        const idNumber = idNumberField ? idNumberField.value.trim() : "";
        const frontFile = frontFileField && frontFileField.files
            ? frontFileField.files[0]
            : null;
        const backFile = backFileField && backFileField.files
            ? backFileField.files[0]
            : null;

        if (!idType) {
            window.alert("Please select an ID type.");
            return;
        }
        if (!idNumber) {
            window.alert("Please enter your ID number.");
            return;
        }
        if (!frontFile) {
            window.alert("Please select the front of your ID.");
            return;
        }
        if (!backFile) {
            window.alert("Please select the back of your ID.");
            return;
        }
        if (!confirmationField || !confirmationField.checked) {
            window.alert("Please confirm that the information and documents are accurate.");
            return;
        }

        const formData = new FormData();
        formData.append("idType", idType);
        formData.append("idNumber", idNumber);
        formData.append("frontId", frontFile);
        formData.append("backId", backFile);

        const originalButtonText = submitButton ? submitButton.textContent : "";
        isSubmitting = true;
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Submitting...";
        }

        try {
            const response = await fetch(`${API_URL}/verification`, {
                method: "POST",
                headers: SahayakAuth.getAuthHeaders(false),
                body: formData
            });
            const result = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(result?.message || "Unable to submit verification.");
            }

            window.alert(result?.message || "Verification submitted successfully.");
            window.location.href = "worker-dashboard.html";
        } catch (error) {
            console.error("Verification submission failed:", error);
            window.alert(error.message || "Unable to submit verification. Please try again.");
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
            isSubmitting = false;
        }
    }

    if (submitButton) {
        submitButton.addEventListener("click", handleSubmit);
    }
})();
