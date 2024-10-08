let currentUser = {};
let currentMission = {};
let maze = [];
let playerPosition = { x: 0, y: 0 };
let currentQuestion = null;
const MAZE_SIZE = 6;

function selectAvatar(avatarId) {
    currentUser.avatar = avatarId;
    document.querySelectorAll('.avatar').forEach(avatar => {
        avatar.classList.remove('selected');
    });
    document.getElementById(avatarId).classList.add('selected');
}

function submitUserForm(event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const grade = document.getElementById('grade').value;
    
    if (!name || !grade || !currentUser.avatar) {
        alert('Please fill in all fields and select an avatar.');
        return;
    }
    
    currentUser = { name, grade, avatar: currentUser.avatar, points: 0 };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    window.location.href = 'diagnostic.html';
}

function submitDiagnosticTest(event) {
    event.preventDefault();
    const answers = document.querySelectorAll('input[type="radio"]:checked');
    let score = 0;
    
    answers.forEach(answer => {
        if (answer.value === '10') {
            score++;
        }
    });
    
    currentUser = JSON.parse(localStorage.getItem('currentUser'));
    currentUser.diagnosticScore = score;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    window.location.href = 'missions.html';
}

function loadMissions(grade) {
    const missions = getMissionsForGrade(grade);
    const missionButtons = document.getElementById('missionButtons');
    missionButtons.innerHTML = '';
    
    missions.forEach((mission, index) => {
        const button = document.createElement('button');
        button.textContent = mission.name;
        button.onclick = () => startMission(mission);
        missionButtons.appendChild(button);
    });
}

function getMissionsForGrade(grade) {
    return [
        { name: 'Algebra Forest', type: 'algebra' },
        { name: 'Geometry Kingdom', type: 'geometry' },
        { name: 'Number Theory Castle', type: 'number_theory' }
    ];
}
function startMission(mission) {
    currentMission = mission;
    document.getElementById('missions').classList.add('hidden');
    document.getElementById('gameContainer').classList.remove('hidden');
    document.getElementById('missionTitle').textContent = mission.name;
    initializeMaze();
    showNextQuestion(); // Add this line to show the first question
}

function showNextQuestion() {
    const question = generateQuestion();
    currentQuestion = question;
    document.getElementById('question').textContent = question.question;
    document.getElementById('answer').value = '';
    document.getElementById('questionContainer').classList.remove('hidden');
}

function submitAnswer() {
    const userAnswer = document.getElementById('answer').value;
    
    if (userAnswer === currentQuestion.answer) {
        currentUser.points += 10;
        alert('Correct! You earned 10 points.');
        movePlayer();
        showNextQuestion(); // Show the next question after a correct answer
    } else {
        alert('Incorrect. Try again!');
    }
    
    document.getElementById('pointsValue').textContent = currentUser.points;
}

function movePlayer() {
    let newX = playerPosition.x;
    let newY = playerPosition.y;
    
    do {
        const direction = Math.floor(Math.random() * 4);
        switch (direction) {
            case 0: newY = Math.max(0, newY - 1); break;
            case 1: newY = Math.min(MAZE_SIZE - 1, newY + 1); break;
            case 2: newX = Math.max(0, newX - 1); break;
            case 3: newX = Math.min(MAZE_SIZE - 1, newX + 1); break;
        }
    } while (maze[newY][newX] === 'obstacle');
    
    playerPosition.x = newX;
    playerPosition.y = newY;
    updatePlayerPosition();
    
    if (newX === MAZE_SIZE - 1 && newY === MAZE_SIZE - 1) {
        alert('Congratulations! You completed the mission!');
        // Add code here to move to the next mission or update overall progress
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'User_setup.html') {
        document.getElementById('userForm').addEventListener('submit', submitUserForm);
    } else if (currentPage === 'diagnostic.html') {
        document.getElementById('diagnosticTest').addEventListener('submit', submitDiagnosticTest);
    } else if (currentPage === 'missions.html') {
        currentUser = JSON.parse(localStorage.getItem('currentUser'));
        document.getElementById('gradeTitle').textContent = `Grade ${currentUser.grade} Missions`;
        document.getElementById('pointsValue').textContent = currentUser.points;
        loadMissions(currentUser.grade);
    }
    
    // Add this event listener for the submit button
    if (document.getElementById('submitAnswer')) {
        document.getElementById('submitAnswer').addEventListener('click', submitAnswer);
    }
});
function initializeMaze() {
    const mazeContainer = document.getElementById('mazeContainer');
    mazeContainer.innerHTML = '';
    mazeContainer.className = `theme-${currentMission.type}`;
    
    for (let y = 0; y < MAZE_SIZE; y++) {
        maze[y] = [];
        for (let x = 0; x < MAZE_SIZE; x++) {
            const cell = document.createElement('div');
            cell.classList.add('mazeCell');
            cell.dataset.x = x;
            cell.dataset.y = y;
            mazeContainer.appendChild(cell);
            
            if (Math.random() < 0.2) {
                cell.classList.add('obstacle');
                maze[y][x] = 'obstacle';
                cell.textContent = '🌳';
            } else if (Math.random() < 0.3) {
                cell.classList.add('question');
                maze[y][x] = 'question';
                cell.textContent = '❓';
            } else {
                cell.classList.add('empty');
                maze[y][x] = 'empty';
            }
        }
    }
    
    playerPosition = { x: 0, y: 0 };
    updatePlayerPosition();
    showNextQuestion();
}

function updatePlayerPosition() {
    document.querySelectorAll('.mazeCell').forEach(cell => {
        cell.classList.remove('player');
        if (cell.classList.contains('empty')) {
            cell.textContent = '';
        }
    });
    const playerCell = document.querySelector(`.mazeCell[data-x="${playerPosition.x}"][data-y="${playerPosition.y}"]`);
    playerCell.classList.add('player');
    playerCell.textContent = '🧑';
}

function generateQuestion() {
    switch (currentMission.type) {
        case 'algebra':
            return generateAlgebraQuestion();
        case 'geometry':
            return generateGeometryQuestion();
        case 'number_theory':
            return generateNumberTheoryQuestion();
        default:
            return generateAlgebraQuestion();
    }
}

function generateAlgebraQuestion() {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    const c = a * b;
    
    return {
        question: `Solve for x: ${a}x + ${b} = ${c}`,
        answer: String(a)
    };
}

function generateGeometryQuestion() {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    
    return {
        question: `What is the area of a rectangle with width ${a} and height ${b}?`,
        answer: String(a * b)
    };
}

function generateNumberTheoryQuestion() {
    const a = Math.floor(Math.random() * 20) + 1;
    const b = Math.floor(Math.random() * 20) + 1;
    
    return {
        question: `What is the greatest common divisor of ${a} and ${b}?`,
        answer: String(gcd(a, b))
    };
}

function gcd(a, b) {
    return b === 0 ? a : gcd(b, a % b);
}

document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'User_setup.html') {
        document.getElementById('userForm').addEventListener('submit', submitUserForm);
    } else if (currentPage === 'diagnostic.html') {
        document.getElementById('diagnosticTest').addEventListener('submit', submitDiagnosticTest);
    } else if (currentPage === 'missions.html') {
        currentUser = JSON.parse(localStorage.getItem('currentUser'));
        document.getElementById('gradeTitle').textContent = `Grade ${currentUser.grade} Missions`;
        document.getElementById('pointsValue').textContent = currentUser.points;
        loadMissions(currentUser.grade);
    }
});

if (document.getElementById('submitAnswer')) {
    document.getElementById('submitAnswer').addEventListener('click', submitAnswer);
}