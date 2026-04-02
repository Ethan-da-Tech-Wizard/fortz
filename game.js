// ==================== GAME STATE ====================
const gameState = {
    fortItems: [],
    selectedToys: [],
    character: {
        hair: '👱',
        face: '😊',
        outfit: '👕',
        shoes: '👟',
        name: ''
    },
    charX: 50,
    charY: 50
};

// ==================== TOY DATA ====================
const allToys = [
    { emoji: '🧱', name: 'Legos' },
    { emoji: '⚽', name: 'Soccer Ball' },
    { emoji: '🏀', name: 'Basketball' },
    { emoji: '🎾', name: 'Tennis Ball' },
    { emoji: '🧸', name: 'Teddy Bear' },
    { emoji: '🪆', name: 'Doll' },
    { emoji: '👸', name: 'Princess Doll' },
    { emoji: '🦸', name: 'Superhero' },
    { emoji: '🦕', name: 'Dinosaur' },
    { emoji: '🦖', name: 'T-Rex' },
    { emoji: '🐉', name: 'Dragon' },
    { emoji: '🦄', name: 'Unicorn' },
    { emoji: '🚗', name: 'Race Car' },
    { emoji: '🚀', name: 'Rocket Ship' },
    { emoji: '🚂', name: 'Train' },
    { emoji: '✈️', name: 'Airplane' },
    { emoji: '🎸', name: 'Guitar' },
    { emoji: '🥁', name: 'Drums' },
    { emoji: '🪄', name: 'Magic Wand' },
    { emoji: '👑', name: 'Crown' },
    { emoji: '🗡️', name: 'Sword' },
    { emoji: '🛡️', name: 'Shield' },
    { emoji: '🔭', name: 'Telescope' },
    { emoji: '🎨', name: 'Art Set' },
    { emoji: '📚', name: 'Books' },
    { emoji: '🧩', name: 'Puzzle' },
    { emoji: '🎲', name: 'Board Game' },
    { emoji: '🪀', name: 'Yo-Yo' },
    { emoji: '🏹', name: 'Bow & Arrow' },
    { emoji: '🐶', name: 'Puppy' },
    { emoji: '🐱', name: 'Kitty' },
    { emoji: '🐰', name: 'Bunny' },
    { emoji: '🦋', name: 'Butterfly' },
    { emoji: '🌟', name: 'Glowy Star' },
    { emoji: '🎪', name: 'Circus Tent' },
    { emoji: '🎭', name: 'Masks' },
    { emoji: '🤖', name: 'Robot' },
    { emoji: '👽', name: 'Alien' },
    { emoji: '🧲', name: 'Magnets' },
    { emoji: '🔬', name: 'Microscope' },
];

// ==================== CHARACTER OPTIONS ====================
const charOptions = {
    hair: ['👱', '👩', '👨', '🧑', '👧', '👦', '👩‍🦰', '👨‍🦰', '👩‍🦱', '👱‍♀️'],
    face: ['😊', '😄', '😎', '🥰', '😋', '🤩', '😺', '🤠', '🥳', '😁'],
    outfit: ['👕', '👗', '🥋', '🦸', '👸', '🧙', '🧚', '🦹', '🥷', '🤴'],
    shoes: ['👟', '👠', '👢', '🥾', '👡', '🩴', '⛸️', '🛼', '👞', '🥿']
};

// ==================== SCREEN NAVIGATION ====================
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function startGame() {
    showScreen('build-screen');
}

function goToToys() {
    showScreen('toys-screen');
    renderToyGrid();
}

function goToCharacter() {
    showScreen('character-screen');
    renderCharacterOptions();
}

function goToPlay() {
    gameState.character.name = document.getElementById('char-name').value || 'Player';
    showScreen('play-screen');
    document.getElementById('fort-title').textContent =
        gameState.character.name + "'s Fort!";
    renderPlayScene();
}

function goToTitle() {
    showScreen('title-screen');
}

// ==================== FORT BUILDING ====================
function setupDragAndDrop() {
    const materials = document.querySelectorAll('.material');
    const fortArea = document.getElementById('fort-area');

    materials.forEach(mat => {
        mat.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', mat.dataset.emoji);
            e.dataTransfer.setData('type', mat.dataset.type);
        });

        // Touch support
        mat.addEventListener('touchstart', handleTouchStart, { passive: false });
        mat.addEventListener('touchmove', handleTouchMove, { passive: false });
        mat.addEventListener('touchend', handleTouchEnd, { passive: false });

        // Click to add (simpler alternative)
        mat.addEventListener('click', () => {
            addToFort(mat.dataset.emoji, mat.dataset.type);
        });
    });

    fortArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        fortArea.classList.add('drag-over');
    });

    fortArea.addEventListener('dragleave', () => {
        fortArea.classList.remove('drag-over');
    });

    fortArea.addEventListener('drop', (e) => {
        e.preventDefault();
        fortArea.classList.remove('drag-over');
        const emoji = e.dataTransfer.getData('text/plain');
        const type = e.dataTransfer.getData('type');
        addToFort(emoji, type);
    });
}

let touchDragElement = null;

function handleTouchStart(e) {
    e.preventDefault();
    touchDragElement = e.target.closest('.material');
}

function handleTouchMove(e) {
    e.preventDefault();
}

function handleTouchEnd(e) {
    if (touchDragElement) {
        addToFort(touchDragElement.dataset.emoji, touchDragElement.dataset.type);
        touchDragElement = null;
    }
}

function addToFort(emoji, type) {
    gameState.fortItems.push({ emoji, type });
    renderFort();
}

function renderFort() {
    const container = document.getElementById('fort-items');
    const hint = document.getElementById('fort-hint');

    if (gameState.fortItems.length > 0) {
        hint.style.display = 'none';
    }

    container.innerHTML = gameState.fortItems.map((item, i) =>
        `<span class="fort-item" onclick="removeFortItem(${i})" title="Click to remove">${item.emoji}</span>`
    ).join('');
}

function removeFortItem(index) {
    gameState.fortItems.splice(index, 1);
    renderFort();
    if (gameState.fortItems.length === 0) {
        document.getElementById('fort-hint').style.display = 'block';
    }
}

// ==================== TOYS ====================
function renderToyGrid() {
    const grid = document.getElementById('toy-grid');
    grid.innerHTML = allToys.map((toy, i) => {
        const selected = gameState.selectedToys.some(t => t.emoji === toy.emoji);
        return `<div class="toy-card ${selected ? 'selected' : ''}" onclick="toggleToy(${i})">
            <span class="toy-emoji">${toy.emoji}</span>
            <span class="toy-name">${toy.name}</span>
        </div>`;
    }).join('');
    renderToyBasket();
}

function toggleToy(index) {
    const toy = allToys[index];
    const existing = gameState.selectedToys.findIndex(t => t.emoji === toy.emoji);
    if (existing >= 0) {
        gameState.selectedToys.splice(existing, 1);
    } else {
        gameState.selectedToys.push(toy);
    }
    renderToyGrid();
}

function renderToyBasket() {
    const basket = document.getElementById('toy-basket');
    const count = document.getElementById('toy-count');
    count.textContent = gameState.selectedToys.length;
    basket.innerHTML = gameState.selectedToys.map(t =>
        `<span class="basket-item">${t.emoji}</span>`
    ).join('');
}

// ==================== CHARACTER CREATOR ====================
function renderCharacterOptions() {
    Object.keys(charOptions).forEach(category => {
        const row = document.getElementById(category + '-options');
        row.innerHTML = charOptions[category].map(opt => {
            const selected = gameState.character[category] === opt;
            return `<button class="option-btn ${selected ? 'selected' : ''}"
                onclick="selectOption('${category}', '${opt}')">${opt}</button>`;
        }).join('');
    });
    updateCharacterPreview();
}

function selectOption(category, value) {
    gameState.character[category] = value;
    renderCharacterOptions();
}

function updateCharacterPreview() {
    document.getElementById('char-hair').textContent = gameState.character.hair;
    document.getElementById('char-face').textContent = gameState.character.face;
    document.getElementById('char-outfit').textContent = gameState.character.outfit;
    document.getElementById('char-shoes').textContent = gameState.character.shoes;
}

// ==================== PLAY MODE ====================
function renderPlayScene() {
    const fortRoof = document.getElementById('fort-roof');
    fortRoof.innerHTML = gameState.fortItems.map(i => i.emoji).join(' ') || '~ Your Fort ~';

    // Set fort background colors based on blankets used
    const scene = document.getElementById('fort-scene');
    const blanketColors = {
        'blanket-red': '#4a1a1a',
        'blanket-blue': '#1a1a4a',
        'blanket-purple': '#2d1b4e',
        'blanket-green': '#1a4a1a',
        'blanket-yellow': '#4a4a1a',
        'blanket-rainbow': '#2d1b4e'
    };
    const blanket = gameState.fortItems.find(i => i.type && i.type.startsWith('blanket'));
    if (blanket && blanketColors[blanket.type]) {
        scene.style.background = `linear-gradient(180deg, ${blanketColors[blanket.type]} 0%, #4a2d6e 100%)`;
    }

    // Render character
    const player = document.getElementById('player-character');
    player.innerHTML = `
        <div style="font-size:0.5em">${gameState.character.hair}</div>
        <div>${gameState.character.face}</div>
        <div style="font-size:0.7em">${gameState.character.outfit}</div>
    `;

    // Render toys
    const toyArea = document.getElementById('placed-toys');
    toyArea.innerHTML = gameState.selectedToys.map((t, i) =>
        `<span class="placed-toy" style="animation-delay: ${i * 0.3}s"
            onclick="interactToy('${t.name}', '${t.emoji}')">${t.emoji}</span>`
    ).join('');
}

function moveCharacter(direction) {
    const step = 8;
    switch(direction) {
        case 'left': gameState.charX = Math.max(10, gameState.charX - step); break;
        case 'right': gameState.charX = Math.min(90, gameState.charX + step); break;
        case 'up': gameState.charY = Math.max(15, gameState.charY - step); break;
        case 'down': gameState.charY = Math.min(85, gameState.charY + step); break;
    }
    const player = document.getElementById('player-character');
    player.style.left = gameState.charX + '%';
    player.style.top = gameState.charY + '%';
}

function doAction(action) {
    const emojis = {
        wave: '👋',
        dance: '💃🕺',
        jump: '⬆️✨',
        sleep: '💤😴'
    };
    showPopup(emojis[action] || '✨');

    if (action === 'dance') {
        const player = document.getElementById('player-character');
        player.style.transition = 'transform 0.2s';
        let count = 0;
        const dance = setInterval(() => {
            player.style.transform = count % 2 === 0
                ? 'translate(-50%, -50%) rotate(10deg) scale(1.1)'
                : 'translate(-50%, -50%) rotate(-10deg) scale(1.1)';
            count++;
            if (count > 6) {
                clearInterval(dance);
                player.style.transform = 'translate(-50%, -50%)';
            }
        }, 200);
    }

    if (action === 'jump') {
        const player = document.getElementById('player-character');
        player.style.transition = 'transform 0.3s ease';
        player.style.transform = 'translate(-50%, -50%) translateY(-40px)';
        setTimeout(() => {
            player.style.transform = 'translate(-50%, -50%)';
        }, 400);
    }
}

function interactToy(name, emoji) {
    showPopup(emoji + ' ' + name + '!');
}

function showPopup(text) {
    const popup = document.getElementById('action-popup');
    popup.textContent = text;
    popup.classList.remove('hidden');
    popup.style.animation = 'none';
    popup.offsetHeight; // trigger reflow
    popup.style.animation = 'popUp 1s ease forwards';
    setTimeout(() => popup.classList.add('hidden'), 1000);
}

// ==================== KEYBOARD CONTROLS ====================
document.addEventListener('keydown', (e) => {
    if (!document.getElementById('play-screen').classList.contains('active')) return;
    switch(e.key) {
        case 'ArrowLeft': case 'a': moveCharacter('left'); break;
        case 'ArrowRight': case 'd': moveCharacter('right'); break;
        case 'ArrowUp': case 'w': moveCharacter('up'); break;
        case 'ArrowDown': case 's': moveCharacter('down'); break;
        case ' ': doAction('jump'); break;
    }
});

// ==================== TABLET ====================
function openTablet() {
    showScreen('tablet-screen');
}

function closeTablet() {
    showScreen('play-screen');
    renderPlayScene();
}

function backToApps() {
    document.getElementById('tablet-game').classList.add('hidden');
    document.getElementById('app-grid').style.display = 'grid';
}

function playTabletGame(gameType) {
    document.getElementById('app-grid').style.display = 'none';
    const gameDiv = document.getElementById('tablet-game');
    gameDiv.classList.remove('hidden');
    const area = document.getElementById('game-area');

    switch(gameType) {
        case 'math': startMathGame(area); break;
        case 'spelling': startSpellingGame(area); break;
        case 'colors': startColorsGame(area); break;
        case 'counting': startCountingGame(area); break;
        case 'shapes': startShapesGame(area); break;
        case 'animals': startAnimalsGame(area); break;
        case 'music': startMusicGame(area); break;
        case 'drawing': startDrawingGame(area); break;
    }
}

// --- Math Game ---
function startMathGame(area) {
    let score = 0;
    function newQuestion() {
        const a = Math.floor(Math.random() * 10) + 1;
        const b = Math.floor(Math.random() * 10) + 1;
        const ops = ['+', '-'];
        const op = ops[Math.floor(Math.random() * ops.length)];
        const answer = op === '+' ? a + b : a - b;
        const wrong1 = answer + Math.floor(Math.random() * 3) + 1;
        const wrong2 = answer - Math.floor(Math.random() * 3) - 1;
        const choices = [answer, wrong1, wrong2].sort(() => Math.random() - 0.5);

        area.innerHTML = `
            <h3>🔢 Math Fun!</h3>
            <div class="score-display">Score: ${score}</div>
            <div class="game-question">${a} ${op} ${b} = ?</div>
            <div class="game-choices">
                ${choices.map(c => `<button class="game-choice" onclick="checkMathAnswer(this, ${c}, ${answer})">${c}</button>`).join('')}
            </div>
        `;
    }
    window.checkMathAnswer = function(btn, chosen, correct) {
        if (chosen === correct) {
            btn.classList.add('correct');
            score++;
            setTimeout(newQuestion, 800);
        } else {
            btn.classList.add('wrong');
            setTimeout(() => btn.classList.remove('wrong'), 500);
        }
    };
    newQuestion();
}

// --- Spelling Game ---
function startSpellingGame(area) {
    const words = [
        { word: 'CAT', hint: '🐱 A furry pet' },
        { word: 'DOG', hint: '🐶 Mans best friend' },
        { word: 'SUN', hint: '☀️ Bright in the sky' },
        { word: 'FISH', hint: '🐟 Swims in water' },
        { word: 'STAR', hint: '⭐ Twinkles at night' },
        { word: 'TREE', hint: '🌳 Has leaves' },
        { word: 'BALL', hint: '⚽ You throw it' },
        { word: 'BOOK', hint: '📖 You read it' },
        { word: 'CAKE', hint: '🎂 Sweet treat' },
        { word: 'FROG', hint: '🐸 Hops around' },
    ];
    let score = 0;
    let current = [];

    function newWord() {
        const w = words[Math.floor(Math.random() * words.length)];
        current = [];
        const letters = w.word.split('').sort(() => Math.random() - 0.5);
        area.innerHTML = `
            <h3>📝 Spelling!</h3>
            <div class="score-display">Score: ${score}</div>
            <p style="font-size:1.2em; margin-bottom:10px">${w.hint}</p>
            <div class="game-question" id="spell-answer" style="min-height:50px; letter-spacing:8px">_</div>
            <div class="game-choices" id="spell-letters">
                ${letters.map((l, i) => `<button class="game-choice" id="sl-${i}" onclick="pickLetter('${l}', ${i}, '${w.word}')">${l}</button>`).join('')}
            </div>
        `;
    }

    window.pickLetter = function(letter, index, correctWord) {
        current.push(letter);
        document.getElementById('sl-' + index).style.visibility = 'hidden';
        document.getElementById('spell-answer').textContent = current.join(' ');

        if (current.length === correctWord.length) {
            if (current.join('') === correctWord) {
                score++;
                document.getElementById('spell-answer').style.color = '#4facfe';
                setTimeout(newWord, 1000);
            } else {
                document.getElementById('spell-answer').style.color = '#ff5050';
                setTimeout(newWord, 1000);
            }
        }
    };
    newWord();
}

// --- Colors Game ---
function startColorsGame(area) {
    const colors = [
        { name: 'Red', hex: '#ff4444', emoji: '🔴' },
        { name: 'Blue', hex: '#4444ff', emoji: '🔵' },
        { name: 'Green', hex: '#44aa44', emoji: '🟢' },
        { name: 'Yellow', hex: '#ffcc00', emoji: '🟡' },
        { name: 'Purple', hex: '#aa44ff', emoji: '🟣' },
        { name: 'Orange', hex: '#ff8800', emoji: '🟠' },
        { name: 'Pink', hex: '#ff66aa', emoji: '🩷' },
        { name: 'Brown', hex: '#8B4513', emoji: '🟤' },
    ];
    let score = 0;

    function newRound() {
        const correct = colors[Math.floor(Math.random() * colors.length)];
        const others = colors.filter(c => c.name !== correct.name).sort(() => Math.random() - 0.5).slice(0, 2);
        const choices = [correct, ...others].sort(() => Math.random() - 0.5);

        area.innerHTML = `
            <h3>🎨 Name the Color!</h3>
            <div class="score-display">Score: ${score}</div>
            <div class="game-question">
                <div style="width:80px; height:80px; border-radius:50%; background:${correct.hex}; margin:0 auto"></div>
            </div>
            <div class="game-choices">
                ${choices.map(c => `<button class="game-choice" onclick="checkColor(this, '${c.name}', '${correct.name}')">${c.emoji} ${c.name}</button>`).join('')}
            </div>
        `;
    }

    window.checkColor = function(btn, chosen, correct) {
        if (chosen === correct) {
            btn.classList.add('correct');
            score++;
            setTimeout(newRound, 800);
        } else {
            btn.classList.add('wrong');
            setTimeout(() => btn.classList.remove('wrong'), 500);
        }
    };
    newRound();
}

// --- Counting Game ---
function startCountingGame(area) {
    const items = ['🍎', '🌟', '🐟', '🦋', '🎈', '🍪', '🌸', '🐝'];
    let score = 0;

    function newRound() {
        const emoji = items[Math.floor(Math.random() * items.length)];
        const count = Math.floor(Math.random() * 8) + 2;
        const display = Array(count).fill(emoji).join(' ');
        const wrong1 = count + Math.floor(Math.random() * 2) + 1;
        const wrong2 = Math.max(1, count - Math.floor(Math.random() * 2) - 1);
        const choices = [...new Set([count, wrong1, wrong2])].sort(() => Math.random() - 0.5);

        area.innerHTML = `
            <h3>🔟 How Many?</h3>
            <div class="score-display">Score: ${score}</div>
            <div class="game-question" style="font-size:1.5em; line-height:1.5">${display}</div>
            <div class="game-choices">
                ${choices.map(c => `<button class="game-choice" onclick="checkCount(this, ${c}, ${count})">${c}</button>`).join('')}
            </div>
        `;
    }

    window.checkCount = function(btn, chosen, correct) {
        if (chosen === correct) {
            btn.classList.add('correct');
            score++;
            setTimeout(newRound, 800);
        } else {
            btn.classList.add('wrong');
            setTimeout(() => btn.classList.remove('wrong'), 500);
        }
    };
    newRound();
}

// --- Shapes Game ---
function startShapesGame(area) {
    const shapes = [
        { name: 'Circle', symbol: '⬤', css: 'width:60px;height:60px;border-radius:50%;background:#4facfe' },
        { name: 'Square', symbol: '⬛', css: 'width:60px;height:60px;background:#ff6b9d' },
        { name: 'Triangle', symbol: '▲', css: 'width:0;height:0;border-left:35px solid transparent;border-right:35px solid transparent;border-bottom:60px solid #50c878' },
        { name: 'Star', symbol: '⭐', css: '' },
        { name: 'Diamond', symbol: '◆', css: 'width:50px;height:50px;background:#ffcc00;transform:rotate(45deg)' },
        { name: 'Heart', symbol: '❤️', css: '' },
    ];
    let score = 0;

    function newRound() {
        const correct = shapes[Math.floor(Math.random() * shapes.length)];
        const others = shapes.filter(s => s.name !== correct.name).sort(() => Math.random() - 0.5).slice(0, 2);
        const choices = [correct, ...others].sort(() => Math.random() - 0.5);

        let shapeDisplay;
        if (correct.css) {
            shapeDisplay = `<div style="${correct.css}; margin:0 auto"></div>`;
        } else {
            shapeDisplay = `<span style="font-size:3em">${correct.symbol}</span>`;
        }

        area.innerHTML = `
            <h3>🔷 What Shape?</h3>
            <div class="score-display">Score: ${score}</div>
            <div class="game-question">${shapeDisplay}</div>
            <div class="game-choices">
                ${choices.map(s => `<button class="game-choice" onclick="checkShape(this, '${s.name}', '${correct.name}')">${s.name}</button>`).join('')}
            </div>
        `;
    }

    window.checkShape = function(btn, chosen, correct) {
        if (chosen === correct) {
            btn.classList.add('correct');
            score++;
            setTimeout(newRound, 800);
        } else {
            btn.classList.add('wrong');
            setTimeout(() => btn.classList.remove('wrong'), 500);
        }
    };
    newRound();
}

// --- Animals Game ---
function startAnimalsGame(area) {
    const animals = [
        { emoji: '🐶', name: 'Dog', sound: 'Woof!' },
        { emoji: '🐱', name: 'Cat', sound: 'Meow!' },
        { emoji: '🐮', name: 'Cow', sound: 'Moo!' },
        { emoji: '🐷', name: 'Pig', sound: 'Oink!' },
        { emoji: '🐸', name: 'Frog', sound: 'Ribbit!' },
        { emoji: '🦁', name: 'Lion', sound: 'Roar!' },
        { emoji: '🐔', name: 'Chicken', sound: 'Cluck!' },
        { emoji: '🐴', name: 'Horse', sound: 'Neigh!' },
        { emoji: '🐑', name: 'Sheep', sound: 'Baa!' },
        { emoji: '🦆', name: 'Duck', sound: 'Quack!' },
    ];
    let score = 0;

    function newRound() {
        const correct = animals[Math.floor(Math.random() * animals.length)];
        const others = animals.filter(a => a.name !== correct.name).sort(() => Math.random() - 0.5).slice(0, 2);
        const choices = [correct, ...others].sort(() => Math.random() - 0.5);

        // Randomly ask about sound or name
        const askSound = Math.random() > 0.5;
        const question = askSound
            ? `Who says "${correct.sound}"?`
            : `What animal is this? ${correct.emoji}`;

        area.innerHTML = `
            <h3>🐾 Animal Friends!</h3>
            <div class="score-display">Score: ${score}</div>
            <div class="game-question" style="font-size:1.3em">${question}</div>
            <div class="game-choices">
                ${choices.map(a => `<button class="game-choice" onclick="checkAnimal(this, '${a.name}', '${correct.name}')">${a.emoji} ${a.name}</button>`).join('')}
            </div>
        `;
    }

    window.checkAnimal = function(btn, chosen, correct) {
        if (chosen === correct) {
            btn.classList.add('correct');
            score++;
            setTimeout(newRound, 800);
        } else {
            btn.classList.add('wrong');
            setTimeout(() => btn.classList.remove('wrong'), 500);
        }
    };
    newRound();
}

// --- Music Game ---
function startMusicGame(area) {
    const notes = [
        { note: 'C', color: '#ff4444', freq: 261.63 },
        { note: 'D', color: '#ff8800', freq: 293.66 },
        { note: 'E', color: '#ffcc00', freq: 329.63 },
        { note: 'F', color: '#44aa44', freq: 349.23 },
        { note: 'G', color: '#4444ff', freq: 392.00 },
        { note: 'A', color: '#aa44ff', freq: 440.00 },
        { note: 'B', color: '#ff44aa', freq: 493.88 },
        { note: 'C2', color: '#ff6666', freq: 523.25 },
    ];

    area.innerHTML = `
        <h3>🎵 Music Maker!</h3>
        <p style="margin-bottom:15px">Tap the keys to make music!</p>
        <div class="music-pad">
            ${notes.map(n => `<button class="music-key" style="background:${n.color}; color:white"
                onclick="playNote(${n.freq}, this)">${n.note}</button>`).join('')}
        </div>
    `;

    let audioCtx = null;
    window.playNote = function(freq, btn) {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);

        btn.style.transform = 'scale(0.95)';
        btn.style.filter = 'brightness(1.3)';
        setTimeout(() => {
            btn.style.transform = '';
            btn.style.filter = '';
        }, 200);
    };
}

// --- Drawing Game ---
function startDrawingGame(area) {
    const colors = ['#000000', '#ff4444', '#ff8800', '#ffcc00', '#44aa44', '#4444ff', '#aa44ff', '#ff44aa', '#ffffff'];
    let currentColor = '#000000';

    area.innerHTML = `
        <h3>✏️ Draw Something!</h3>
        <div class="color-picker">
            ${colors.map(c => `<div class="color-dot ${c === currentColor ? 'active' : ''}"
                style="background:${c}" onclick="setDrawColor('${c}', this)"></div>`).join('')}
        </div>
        <canvas class="drawing-canvas" id="draw-canvas" width="350" height="250"></canvas>
        <br>
        <button class="game-choice" onclick="clearCanvas()" style="margin-top:10px">🗑️ Clear</button>
    `;

    const canvas = document.getElementById('draw-canvas');
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.strokeStyle = currentColor;

    let drawing = false;

    function getPos(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: (clientX - rect.left) * (canvas.width / rect.width),
            y: (clientY - rect.top) * (canvas.height / rect.height)
        };
    }

    canvas.addEventListener('mousedown', (e) => { drawing = true; const p = getPos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); });
    canvas.addEventListener('mousemove', (e) => { if (!drawing) return; const p = getPos(e); ctx.lineTo(p.x, p.y); ctx.stroke(); });
    canvas.addEventListener('mouseup', () => drawing = false);
    canvas.addEventListener('mouseleave', () => drawing = false);

    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); drawing = true; const p = getPos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); });
    canvas.addEventListener('touchmove', (e) => { e.preventDefault(); if (!drawing) return; const p = getPos(e); ctx.lineTo(p.x, p.y); ctx.stroke(); });
    canvas.addEventListener('touchend', () => drawing = false);

    window.setDrawColor = function(color, dot) {
        currentColor = color;
        ctx.strokeStyle = color;
        document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
    };

    window.clearCanvas = function() {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = currentColor;
    };
}

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
    setupDragAndDrop();
});
