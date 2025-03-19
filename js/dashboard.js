document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("url-form");
    const urlInput = document.getElementById("url-input");
    const submitButton = document.getElementById("submit-button");
    const spinner = document.getElementById("spinner");
    const errorContainer = document.getElementById("error-container");
    const errorMessage = document.getElementById("error-message");
    const summaryContainer = document.getElementById("current-summary");
    const summaryUrl = document.getElementById("summary-url");
    const summaryContent = document.getElementById("summary-content");
    const summaryLink = document.getElementById("summary-link");
    const summaryDate = document.getElementById("summary-date");
    const sidebar = document.querySelector(".sidebar");
    const sidebarOverlay = document.querySelector(".sidebar-overlay");
    const hamburgerMenu = document.querySelector(".hamburger-menu");
    const closeSidebar = document.querySelector(".close-sidebar");
    const logoutButton = document.getElementById("logout-button");
    const loginButton = document.getElementById("login-button");
    const loginNotice = document.getElementById("login-notice");

    // API Endpoints
    const API_BASE = "https://url-insights.onrender.com/api";
    const SUMMARIZE_URL = `${API_BASE}/summarize`;
    const GET_SUMMARIES_URL = `${API_BASE}/my-summaries`;

    // Check authentication status and toggle buttons
    function checkAuthStatus() {
        const token = localStorage.getItem("access_token");
        if (token) {
            loginButton.classList.add("hidden");
            logoutButton.classList.remove("hidden");
            loginNotice.classList.add("hidden");
            fetchSummaries();
        } else {
            loginButton.classList.remove("hidden");
            logoutButton.classList.add("hidden");
            loginNotice.classList.remove("hidden");
        }
    }

    // Handle Form Submission
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const url = urlInput.value.trim();
        if (!url) return;

        // Show loading state
        submitButton.disabled = true;
        spinner.classList.remove("hidden");
        errorContainer.classList.add("hidden");

        try {
            const token = localStorage.getItem("access_token");
            const response = await fetch(`${SUMMARIZE_URL}?url=${encodeURIComponent(url)}`, {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Authorization": `Bearer ${token}`
                },
            });
            const data = await response.json();
            
            if (!response.ok) throw new Error(data.detail || "Failed to summarize");
            
            displaySummary(url, data.summary, data.saved);
        } catch (error) {
            showError(error.message);
        } finally {
            submitButton.disabled = false;
            spinner.classList.add("hidden");
        }
    });

    // Display Summary
    function displaySummary(url, summary, saved) {
        summaryUrl.textContent = url;
        summaryContent.textContent = summary;
        summaryLink.href = url;
        summaryLink.textContent = url;
        summaryDate.textContent = new Date().toLocaleString();
        summaryContainer.classList.remove("hidden");

        // Store the summary in localStorage
        localStorage.setItem("current_summary", JSON.stringify({ url, summary, date: new Date().toLocaleString() }));
    }

    // Show Error Message
    function showError(message) {
        errorMessage.textContent = message;
        errorContainer.classList.remove("hidden");
    }

    // Fetch and Display Saved Summaries
    async function fetchSummaries() {
        try {
            const token = localStorage.getItem("access_token");
            if (!token) {
                console.error("User not logged in");
                return;
            }
            const response = await fetch(GET_SUMMARIES_URL, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error("Failed to load summaries");
            const summaries = await response.json();
            renderSummaries(summaries);
        } catch (error) {
            console.error(error.message);
        }
    }

    // Render Saved Summaries
    function renderSummaries(summaries) {
        const summaryList = document.getElementById("summary-list");
        summaryList.innerHTML = "";

        // Sort summaries by date in descending order
        summaries.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (summaries.length === 0) {
            summaryList.innerHTML = `<p>No saved summaries found.</p>`;
            return;
        }
        summaries.forEach(({ url, content, date }) => {
            const item = document.createElement("div");
            item.classList.add("summary-item");
            item.innerHTML = `
                <a href="#" class="summary-url">${url}</a>
                <p class="summary-text">${content.substring(0, 80).trim()}${content.length > 50 ? '...' : ''}</p>
            `;
            item.addEventListener("click", () => {
                displaySummary(url, content, true);
            });
            summaryList.appendChild(item);
        });
    }

    // Sidebar Toggle Functionality
    function toggleSidebar() {
        sidebar.classList.toggle("open");
        sidebarOverlay.classList.toggle("visible");
    }

    hamburgerMenu.addEventListener("click", toggleSidebar);
    closeSidebar.addEventListener("click", toggleSidebar);
    sidebarOverlay.addEventListener("click", toggleSidebar);

    // Logout Functionality
    logoutButton.addEventListener("click", () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("current_summary");
        window.location.reload();
    });

    // Check authentication status on page load
    checkAuthStatus();

    // Load the current summary from localStorage
    const currentSummary = JSON.parse(localStorage.getItem("current_summary"));
    if (currentSummary) {
        displaySummary(currentSummary.url, currentSummary.summary, true);
    }
});