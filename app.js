document.addEventListener('DOMContentLoaded', () => {
    // State
    let gradeWeightPairs = [];

    // Constants
    const gradePoints = {
        "AA": 4.0, "BA": 3.5, "BB": 3.0, "CB": 2.5, 
        "CC": 2.0, "DC": 1.5, "DD": 1.0, "FF": 0.0
    };

    // DOM Elements
    const finalGpaDisplay = document.getElementById('final-gpa');
    const courseList = document.getElementById('course-list');
    
    // Tabs
    const tabStandard = document.getElementById('tab-standard');
    const tabExam = document.getElementById('tab-exam');
    const sectionStandard = document.getElementById('section-standard');
    const sectionExam = document.getElementById('section-exam');

    // Standard Form
    const gradeSelect = document.getElementById('grade-select');
    const weightSelect = document.getElementById('weight-select');
    const addStandardBtn = document.getElementById('add-standard-btn');

    // Exam Form
    const midtermWeightInput = document.getElementById('midterm-weight');
    const midtermScoreInput = document.getElementById('midterm-score');
    const finalWeightInput = document.getElementById('final-weight');
    const finalScoreInput = document.getElementById('final-score');
    const examCourseWeightSelect = document.getElementById('exam-course-weight');
    const addExamBtn = document.getElementById('add-exam-btn');
    
    // Exam Live Result
    const examResultDisplay = document.getElementById('exam-result-display');
    const examCalculatedScore = document.getElementById('exam-calculated-score');
    const examCalculatedGrade = document.getElementById('exam-calculated-grade');

    // Global Actions
    const clearAllBtn = document.getElementById('clear-all-btn');

    // --- Core Logic ---

    function calculateGPA() {
        if (gradeWeightPairs.length === 0) {
            finalGpaDisplay.textContent = "0.00";
            return;
        }

        let totalWeight = 0;
        let weightedSum = 0;

        for (const pair of gradeWeightPairs) {
            const grade = pair.grade.toUpperCase();
            const weight = parseFloat(pair.weight);
            totalWeight += weight;
            weightedSum += gradePoints[grade] * weight;
        }

        const gpa = totalWeight > 0 ? weightedSum / totalWeight : 0;
        finalGpaDisplay.textContent = gpa.toFixed(2);
        
        // Add a small animation to highlight change
        finalGpaDisplay.style.transform = "scale(1.1)";
        setTimeout(() => {
            finalGpaDisplay.style.transform = "scale(1)";
        }, 150);
    }

    function calculateLetterGrade(score) {
        if (score >= 80) return "AA";
        if (score >= 71) return "BA";
        if (score >= 63) return "BB";
        if (score >= 55) return "CB";
        if (score >= 50) return "CC";
        if (score >= 45) return "DC";
        if (score >= 35) return "DD";
        return "FF";
    }

    // --- UI Updaters ---

    function renderCourseList() {
        courseList.innerHTML = '';

        if (gradeWeightPairs.length === 0) {
            const emptyState = document.createElement('li');
            emptyState.className = 'empty-state';
            emptyState.textContent = 'No courses added yet.';
            courseList.appendChild(emptyState);
            return;
        }

        gradeWeightPairs.forEach((pair, index) => {
            const li = document.createElement('li');
            li.className = 'course-item';
            
            li.innerHTML = `
                <div class="course-info">
                    <span class="course-grade">${pair.grade}</span>
                    <span class="course-weight">Weight: ${pair.weight}</span>
                </div>
                <button class="delete-btn" aria-label="Remove Course">×</button>
            `;

            // Attach delete event
            li.querySelector('.delete-btn').addEventListener('click', () => {
                removeCourse(index);
            });

            courseList.appendChild(li);
        });
    }

    function addCourse(grade, weight) {
        gradeWeightPairs.push({ grade, weight });
        renderCourseList();
        calculateGPA();
    }

    function removeCourse(index) {
        gradeWeightPairs.splice(index, 1);
        renderCourseList();
        calculateGPA();
    }

    function updateLiveExamPreview() {
        const mWeight = parseFloat(midtermWeightInput.value);
        const mScore = parseFloat(midtermScoreInput.value);
        const fWeight = parseFloat(finalWeightInput.value);
        const fScore = parseFloat(finalScoreInput.value);

        if (!isNaN(mWeight) && !isNaN(mScore) && !isNaN(fWeight) && !isNaN(fScore) && (mWeight + fWeight > 0)) {
            const combinedScore = (mScore * mWeight + fScore * fWeight) / (mWeight + fWeight);
            const combinedGrade = calculateLetterGrade(combinedScore);

            examCalculatedScore.textContent = combinedScore.toFixed(2);
            examCalculatedGrade.textContent = combinedGrade;
            examResultDisplay.classList.remove('hidden');
        } else {
            examResultDisplay.classList.add('hidden');
        }
    }

    // --- Event Listeners ---

    // Tabs
    tabStandard.addEventListener('click', () => {
        tabStandard.classList.add('active');
        tabExam.classList.remove('active');
        sectionStandard.classList.remove('hidden');
        sectionExam.classList.add('hidden');
    });

    tabExam.addEventListener('click', () => {
        tabExam.classList.add('active');
        tabStandard.classList.remove('active');
        sectionExam.classList.remove('hidden');
        sectionStandard.classList.add('hidden');
    });

    // Standard Add
    addStandardBtn.addEventListener('click', () => {
        const grade = gradeSelect.value;
        const weight = weightSelect.value;
        if (grade && weight) {
            addCourse(grade, weight);
            // reset grade select slightly for UX
            gradeSelect.value = "AA";
        }
    });

    // Exam Live Preview inputs
    [midtermWeightInput, midtermScoreInput, finalWeightInput, finalScoreInput].forEach(input => {
        input.addEventListener('input', updateLiveExamPreview);
    });

    // Exam Add
    addExamBtn.addEventListener('click', () => {
        const mWeight = parseFloat(midtermWeightInput.value);
        const mScore = parseFloat(midtermScoreInput.value);
        const fWeight = parseFloat(finalWeightInput.value);
        const fScore = parseFloat(finalScoreInput.value);
        const courseWeight = examCourseWeightSelect.value;

        if (isNaN(mWeight) || isNaN(mScore) || isNaN(fWeight) || isNaN(fScore)) {
            alert("Please enter valid numbers for weights and scores.");
            return;
        }

        if (mWeight + fWeight === 0) {
            alert("Total weight cannot be zero.");
            return;
        }

        const combinedScore = (mScore * mWeight + fScore * fWeight) / (mWeight + fWeight);
        const combinedGrade = calculateLetterGrade(combinedScore);

        addCourse(combinedGrade, courseWeight);

        // Reset scores for UX
        midtermScoreInput.value = '';
        finalScoreInput.value = '';
        updateLiveExamPreview();
    });

    // Clear All
    clearAllBtn.addEventListener('click', () => {
        if (gradeWeightPairs.length > 0 && confirm("Are you sure you want to clear all courses?")) {
            gradeWeightPairs = [];
            renderCourseList();
            calculateGPA();
        }
    });

    // Initialize
    renderCourseList();
    calculateGPA();
});
