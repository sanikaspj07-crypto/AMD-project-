document.addEventListener('DOMContentLoaded', () => {
    // --- Initializing Inputs ---
    const inputs = ['study', 'screen', 'sleep', 'years'];
    const elements = {};
    
    inputs.forEach(id => {
        elements[id] = document.getElementById(id);
        elements[`${id}Val`] = document.getElementById(`${id}-val`);
        elements[id].addEventListener('input', () => {
            elements[`${id}Val`].textContent = elements[id].value;
            // Immediate feedback on UI change (optional but cool)
            if(!document.getElementById('result-section').classList.contains('hidden')){
                calculateCompoundEffect(); // auto recalc if already shown
            }
        });
    });

    const resultSection = document.getElementById('result-section');
    let lineChart;
    let typeTimeout;

    const generatePersona = (study, screen, sleep, consistency) => {
        if (study >= 8 && sleep < 6) {
            return {
                name: "The Burnout Martyr 🕯️",
                desc: "Sacrificing your health for productivity. In the short term, you achieve a lot. But long-term exhaustion leads to a forced crash.",
                color: "#f59e0b"
            };
        }
        if (study >= 6 && screen <= 3 && sleep >= 7 && (consistency === 'high' || consistency === 'medium')) {
            return {
                name: "The Elite Architect 👑",
                desc: "Pinnacle of discipline. You treat your life like a masterpiece. This compounding effect makes you virtually unstoppable.",
                color: "#10b981"
            };
        }
        if (screen >= 7 && study <= 3) {
            return {
                name: "The Digital Ghost 👻",
                desc: "Trapped in the dopamine loop. Your potential is being slowly drained by algorithms. Focus diminishes drastically.",
                color: "#ef4444"
            };
        }
        if (consistency === 'low') {
            return {
                name: "The False Starter 🚦",
                desc: "Bursts of intense inspiration followed by weeks of inaction. This shatters the compounding effect.",
                color: "#f59e0b"
            };
        }
        if (study >= 4 && screen <= 5 && sleep >= 6) {
            return {
                name: "The Steady Climber ⛰️",
                desc: "Excellent balance. Not extreme in any direction, but your sustainable habits ensure gradual, guaranteed upward progress.",
                color: "#06b6d4"
            };
        }
        return {
            name: "The Average Drifter 🛋️",
            desc: "You take the path of least resistance. You aren't destroying your future, but you aren't actively building it either.",
            color: "#94a3b8"
        };
    };

    const typeText = (element, text, speed = 25) => {
        element.textContent = '';
        clearTimeout(typeTimeout);
        let i = 0;
        const typeWriter = () => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                typeTimeout = setTimeout(typeWriter, speed);
            }
        }
        typeWriter();
    };

    const calculateCompoundEffect = () => {
        const study = parseFloat(elements.study.value);
        const screen = parseFloat(elements.screen.value);
        const sleep = parseFloat(elements.sleep.value);
        const years = parseInt(elements.years.value);
        const consistency = document.querySelector('input[name="consistency"]:checked').value;
        
        // Calculate Base Yearly Growth Rate
        let yearlyImpact = 0;
        
        // Study impact
        if (study >= 2) yearlyImpact += (study - 2) * 2; 
        else yearlyImpact -= 3;

        // Screen time impact
        if (screen > 4) yearlyImpact -= Math.pow(screen - 4, 1.4);
        else yearlyImpact += 2;

        // Sleep impact 
        const sleepDev = Math.abs(sleep - 8);
        if (sleep < 7) yearlyImpact -= (sleepDev * 2.5);
        else if (sleep >= 7 && sleep <= 9) yearlyImpact += 3;

        // Consistency multiplier
        let conMult = 1;
        if (consistency === 'high') conMult = 1.3;
        if (consistency === 'low') conMult = 0.5;
        
        // Apply consistency 
        if (yearlyImpact > 0) yearlyImpact *= conMult;
        else if (consistency === 'low') yearlyImpact *= 1.4; // bad habits + low consistency = ruin

        let currentScore = 50;
        const labels = ['Now'];
        const dataPoints = [currentScore];

        for (let i = 1; i <= years; i++) {
            // Apply compound calculation: Score += yearly impact * compound modifier
            const compoundModifier = 1 + (i * 0.05);
            currentScore += (yearlyImpact * compoundModifier);
            if(currentScore < 0) currentScore = 0;
            if(currentScore > 100) currentScore = 100;
            
            labels.push(`Yr ${i}`);
            dataPoints.push(Math.round(currentScore));
        }

        const finalScore = Math.round(currentScore);
        
        // UI Updates
        resultSection.classList.remove('hidden');
        document.getElementById('final-score').textContent = finalScore;
        
        // Personas
        const persona = generatePersona(study, screen, sleep, consistency);
        document.getElementById('persona-badge').textContent = `AI Profile Match (Year ${years})`;
        document.getElementById('persona-name').textContent = persona.name;
        document.getElementById('persona-name').style.color = persona.color;
        
        typeText(document.getElementById('persona-desc'), persona.desc, 30);

        // Chart
        updateLineChart(labels, dataPoints, persona.color);
        
        // Dynamic Suggestions
        const suggestionsBox = document.getElementById('suggestions-list');
        suggestionsBox.innerHTML = '';
        const suggestions = [];
        if (sleep < 7) suggestions.push('Neuro-Optimization: Increase sleep to 7+ hours. Cognitive compound interest requires REM cycles.');
        if (screen > 5) suggestions.push('Dopamine Detox: Screen overconsumption is dragging down your timeline. Implement app blockers.');
        if (study < 2) suggestions.push('Skill Deficit: You lack deep work blocks. Even 1 extra hour a day compounds massively over years.');
        if (consistency === 'low') suggestions.push('System Failure: Erratic output kills positive momentum. Build micro-habits before huge goals.');
        
        if (suggestions.length === 0) suggestions.push('Trajectory Optimal: Keep executing. Your timeline metrics are highly favorable.');
        
        suggestions.forEach(s => {
            const li = document.createElement('li');
            li.textContent = s;
            suggestionsBox.appendChild(li);
        });

        // Circle Update
        const circle = document.querySelector('.score-circle');
        circle.style.background = `conic-gradient(${persona.color} ${finalScore}%, transparent 0%)`;

        if (!resultSection.classList.contains('scrolled')) {
            setTimeout(() => {
                resultSection.scrollIntoView({ behavior: 'smooth' });
                resultSection.classList.add('scrolled'); // Only scroll automatically once
            }, 100);
        }
    };

    const updateLineChart = (labels, data, color) => {
        const ctx = document.getElementById('lineChart').getContext('2d');
        if (lineChart) lineChart.destroy();

        lineChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Success Trajectory',
                    data: data,
                    borderColor: color,
                    backgroundColor: `${color}33`, 
                    fill: true,
                    tension: 0.4,
                    pointRadius: 3,
                    pointBackgroundColor: color,
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        min: 0,
                        max: 100,
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        ticks: { color: '#94a3b8', font: {size: 10} }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#94a3b8', font: {size: 10} }
                    }
                },
                plugins: { legend: { display: false } },
                animation: { duration: 800 }
            }
        });
    };

    document.getElementById('predict-btn').addEventListener('click', calculateCompoundEffect);
    
    document.getElementById('reset-btn').addEventListener('click', () => {
        resultSection.classList.add('hidden');
        resultSection.classList.remove('scrolled');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});
