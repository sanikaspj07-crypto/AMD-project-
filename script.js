document.addEventListener("DOMContentLoaded", () => {
    
    // Simple mock database using localStorage to persist users between pages
    const dbUsers = JSON.parse(localStorage.getItem("foodAiUsers")) || [];
    
    // ==========================================
    // 1. LOGIN PAGE LOGIC
    // ==========================================
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const email = document.getElementById("login-email").value.trim();
            const password = document.getElementById("login-password").value;
            const errorElement = document.getElementById("login-error");

            // Validate against stored users
            const user = dbUsers.find(u => u.email === email && u.password === password);
            if (user) {
                localStorage.setItem("currentUser", JSON.stringify(user));
                window.location.href = "dashboard.html";
            } else {
                errorElement.textContent = "Invalid email or password.";
            }
        });
    }

    // ==========================================
    // 2. SIGNUP PAGE LOGIC
    // ==========================================
    const signupForm = document.getElementById("signup-form");
    if (signupForm) {
        signupForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const name = document.getElementById("signup-name").value.trim();
            const email = document.getElementById("signup-email").value.trim();
            const password = document.getElementById("signup-password").value;
            const errorElement = document.getElementById("signup-error");

            if (dbUsers.find(u => u.email === email)) {
                errorElement.textContent = "Email already registered.";
                return;
            }

            // Create user and auto-login
            const newUser = { name, email, password };
            dbUsers.push(newUser);
            localStorage.setItem("foodAiUsers", JSON.stringify(dbUsers));
            localStorage.setItem("currentUser", JSON.stringify(newUser));
            
            window.location.href = "dashboard.html";
        });
    }

    // ==========================================
    // 3. DASHBOARD LOGIC
    // ==========================================
    const dashboardContainer = document.getElementById("dashboard-container");
    if (dashboardContainer) {
        // Authenticate check
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));
        if (!currentUser) {
            window.location.href = "login.html"; // Protect route
            return;
        }

        // Set personalized welcome message
        document.getElementById("welcome-msg").textContent = `Welcome, ${currentUser.name}!`;

        // Handle Logout
        document.getElementById("logout-btn").addEventListener("click", () => {
            localStorage.removeItem("currentUser");
            window.location.href = "login.html";
        });

        // UI Event Listeners for Slider
        const hungerSlider = document.getElementById("hunger-slider");
        const hungerVal = document.getElementById("hunger-val");
        hungerSlider.addEventListener("input", (e) => {
            hungerVal.textContent = e.target.value;
        });

        const suggestBtn = document.getElementById("suggest-btn");
        const swapBtn = document.getElementById("swap-btn");
        const resultsView = document.getElementById("results-view");
        
        let currentSuggestionsPool = [];
        let currentSuggestionIndex = 0;

        // Generate Suggestion Event
        suggestBtn.addEventListener("click", () => {
            const mood = document.getElementById("mood-select").value;
            const activity = document.getElementById("activity-input").value || "doing your activity";
            const hunger = parseInt(hungerSlider.value);
            const time = new Date().getHours();

            // Fetch AI Logic
            currentSuggestionsPool = generateSuggestions(mood, time, hunger, activity);
            currentSuggestionIndex = 0;
            
            renderSuggestion();
            resultsView.style.display = "block";
            // Smooth scroll down to results
            resultsView.scrollIntoView({ behavior: "smooth", block: "start" });
        });

        // Swap Suggestion Feature
        swapBtn.addEventListener("click", () => {
            currentSuggestionIndex = (currentSuggestionIndex + 1) % currentSuggestionsPool.length;
            renderSuggestion();
        });

        // Render data to DOM
        function renderSuggestion() {
            const data = currentSuggestionsPool[currentSuggestionIndex];
            
            document.getElementById("food-suggestion").textContent = data.food;
            document.getElementById("health-score").textContent = data.score;
            document.getElementById("reason-text").textContent = data.reason;
            document.getElementById("avoid-text").textContent = data.avoidMsg;
            document.getElementById("future-text").textContent = data.consequence;
            
            // Adjust score color dynamically based on healthiness
            const scoreEl = document.getElementById("health-score");
            if(data.score >= 80) scoreEl.style.color = "var(--primary)";
            else if(data.score >= 50) scoreEl.style.color = "#d97706"; // warning orange
            else scoreEl.style.color = "var(--danger)";
        }
    }

    // ==========================================
    // 4. MOCKED AI LOGIC SYSTEM
    // ==========================================
    function generateSuggestions(mood, hour, hunger, activity) {
        let isLateNight = (hour >= 21 || hour < 5);
        let timePeriod = isLateNight ? "late night" : "the day time";

        // Structured food database by mood
        const pools = {
            happy: [
                { food: "Berry & Yogurt Parfait", score: 92, badFood: "huge sugary dessert" },
                { food: "Grilled Lemon Chicken Bowl", score: 88, badFood: "greasy fast food burger" }
            ],
            stressed: [
                { food: "Roasted Almonds & Dark Chocolate", score: 75, badFood: "bag of potato chips" },
                { food: "Avocado Toast with Chili Flakes", score: 85, badFood: "processed donuts" }
            ],
            bored: [
                { food: "Crispy Apple & Peanut Butter", score: 80, badFood: "mindless candy grazing" },
                { food: "Carrot Sticks & Hummus", score: 86, badFood: "highly processed crackers" }
            ],
            tired: [
                { food: "Oatmeal with Sliced Bananas", score: 90, badFood: "heavy carb-loaded pasta" },
                { food: "Green Tea & Mixed Nuts", score: 82, badFood: "extreme artificial energy drinks" }
            ]
        };

        const moodPool = pools[mood] || pools["happy"];
        
        // Map database into user-specific responses using interpolation
        return moodPool.map(item => {
            // Apply deductions based on context
            let scorePenalty = isLateNight ? 5 : 0;
            scorePenalty += (hunger > 7) ? 5 : 0;
            let finalScore = Math.max(10, item.score - scorePenalty);

            return {
                food: item.food,
                score: finalScore,
                reason: `Because you're feeling ${mood} while ${activity}, your brain is seeking dopamine. But instead of junk, ${item.food} tricks your brain by providing maximum flavor and satisfaction.`,
                avoidMsg: `Absolutely avoid grabbing a ${item.badFood}. Eating that during ${timePeriod} will completely derail your digestion and cause a massive crash.`,
                consequence: `Consistently choosing this over junk builds metabolic resilience, keeps your focus sharp, and regulates your future emotional cravings.`
            };
        });
    }
});
