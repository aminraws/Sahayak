(function () {
    SahayakAuth.protectWorkerPage();

    const continueButton = document.querySelector(".continue-btn");
    if (continueButton && continueButton.tagName === "A") {
        continueButton.addEventListener("click", (event) => {
            const confirmCheckbox = document.getElementById("confirm");
            if (confirmCheckbox && !confirmCheckbox.checked) {
                event.preventDefault();
                window.alert("Please confirm the information before continuing.");
            }
        });
    }
})();
