/*
 * Program: fortz - game.js
 * Programmer: Ethan-da-Tech-Wizard (written with Claude, an AI assistant)
 * Last Modified: 2026-11-18
 * Purpose: The whole game logic for Fort Builder: screen switching, fort building, toy and
 *          character pickers, the play scene, and eight small tablet mini-games.
 *
 * (The original author banner below is kept as it was.)
 */

/**
 * Program: Fort Builder Game Engine
 * Programmer: Ethan Kilmer
 * Last Modified: 11/08/2026
 * Purpose: Interactive browser game for building personalized blanket forts, selecting
 *          custom toy loadouts, customizing player characters, and engaging in 8 embedded
 *          educational mini-games (Math, Spelling, Colors, Counting, Shapes, Animals, Music, Drawing).
 */

// ==================== CORE GAME STATE ====================
// Tracks fort structure elements, selected toy inventory, avatar customization, and 2D spatial positioning
// This one object remembers everything the player has chosen so far.
// Every screen reads from it and writes to it, so it is the game's memory.
const gameState = {
    // Each entry is { emoji, type } (see addToFort).
    fortItems: [],      // Array of placed blankets, pillows, and decorative lights
    selectedToys: [],   // Array of active toys selected from the toy box to bring into the fort
    // The look of the player's avatar: one emoji per body part, plus a name.
    character: {        // Avatar customization properties (hair style, facial expression, shirt, shoes, name)
        hair: '👱',
        face: '😊',
        outfit: '👕',
        shoes: '👟',
        name: ''
    },
    // Position is stored as a percentage so it works at any screen size.
    charX: 50,          // Current avatar X coordinate inside the fort room (percentage based)
    charY: 50           // Current avatar Y coordinate inside the fort room (percentage based)
};

// ==================== COMPREHENSIVE TOY CATALOG ====================
// Exhaustive list of 40 interactive toys with emojis and descriptive titles
// A plain list of toy objects. Each has an emoji picture and a name.
// The toy picker screen builds its grid from this list.
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
// For each body part, the list of emoji the player can choose from.
// The keys (hair, face, outfit, shoes) match the HTML ids like 'hair-options'.
const charOptions = {
    hair: ['👱', '👩', '👨', '🧑', '👧', '👦', '👩‍🦰', '👨‍🦰', '👩‍🦱', '👱‍♀️'],
    face: ['😊', '😄', '😎', '🥰', '😋', '🤩', '😺', '🤠', '🥳', '😁'],
    outfit: ['👕', '👗', '🥋', '🦸', '👸', '🧙', '🧚', '🦹', '🥷', '🤴'],
    shoes: ['👟', '👠', '👢', '🥾', '👡', '🩴', '⛸️', '🛼', '👞', '🥿']
};

// ==================== SCREEN NAVIGATION ====================
/**
 * Show one screen and hide all the others.
 * @param {string} id - the HTML id of the screen to show.
 */
// Hide every screen first by removing the 'active' class (CSS shows only .active).
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    // Then turn on just the screen we asked for.
    document.getElementById(id).classList.add('active');
}

/**
 * Called by the title screen button; moves on to the fort-building screen.
 */
function startGame() {
    showScreen('build-screen');
}

/**
 * Move to the toy picker screen and draw the toy grid.
 */
function goToToys() {
    showScreen('toys-screen');
    renderToyGrid();
}

/**
 * Move to the character creator and draw its option buttons.
 */
function goToCharacter() {
    showScreen('character-screen');
    renderCharacterOptions();
}

/**
 * Move to the play screen, saving the typed name first.
 */
// Use the typed name, or 'Player' if the box was left empty.
function goToPlay() {
    gameState.character.name = document.getElementById('char-name').value || 'Player';
    // Show the play screen and put the name into the title.
    showScreen('play-screen');
    document.getElementById('fort-title').textContent =
        gameState.character.name + "'s Fort!";
    // Draw the fort, avatar and toys the player chose.
    renderPlayScene();
}

/**
 * Go back to the title screen (the Home button).
 */
function goToTitle() {
    showScreen('title-screen');
}

// ==================== FORT BUILDING ====================
/**
 * Attach all the mouse, touch and click listeners for fort building.
 * Runs once after the page has loaded (see the INIT section at the bottom).
 */
// Grab every material button and the drop zone from the page.
function setupDragAndDrop() {
    const materials = document.querySelectorAll('.material');
    const fortArea = document.getElementById('fort-area');

    // Give each material the same set of behaviours.
    materials.forEach(mat => {
        // When dragging starts, store the emoji and type so the drop zone can read them.
        mat.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', mat.dataset.emoji);
            e.dataTransfer.setData('type', mat.dataset.type);
        });

        // (touch handlers are defined just below; passive:false lets them call preventDefault)
        // Touch support
        mat.addEventListener('touchstart', handleTouchStart, { passive: false });
        mat.addEventListener('touchmove', handleTouchMove, { passive: false });
        mat.addEventListener('touchend', handleTouchEnd, { passive: false });

        // Click to add (simpler alternative)
        mat.addEventListener('click', () => {
            addToFort(mat.dataset.emoji, mat.dataset.type);
        });
    });

    // dragover must call preventDefault or the browser will not allow a drop here.
    // We also add a class so the CSS can highlight the zone.
    fortArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        fortArea.classList.add('drag-over');
    });

    // Remove the highlight when the dragged item leaves.
    fortArea.addEventListener('dragleave', () => {
        fortArea.classList.remove('drag-over');
    });

    // On drop, read back the emoji and type that dragstart saved, and add them.
    fortArea.addEventListener('drop', (e) => {
        e.preventDefault();
        fortArea.classList.remove('drag-over');
        const emoji = e.dataTransfer.getData('text/plain');
        const type = e.dataTransfer.getData('type');
        addToFort(emoji, type);
    });
}

// Remembers which material a finger touched (null when none).
let touchDragElement = null;

/**
 * Touch began: remember which material was touched.
 * @param {TouchEvent} e
 */
// preventDefault stops the page scrolling or firing a mouse click as well.
function handleTouchStart(e) {
    e.preventDefault();
    // closest() finds the material element even if the finger hit a child of it.
    touchDragElement = e.target.closest('.material');
}

/**
 * Touch moved: just block scrolling while dragging.
 * @param {TouchEvent} e
 */
function handleTouchMove(e) {
    e.preventDefault();
}

/**
 * Touch ended: add the touched material to the fort.
 * @param {TouchEvent} e
 */
// Only act if a material was really touched.
function handleTouchEnd(e) {
    if (touchDragElement) {
        addToFort(touchDragElement.dataset.emoji, touchDragElement.dataset.type);
        touchDragElement = null;
    }
}

/**
 * Add one item to the fort and redraw it.
 * @param {string} emoji - the picture to show.
 * @param {string} type - the kind of item, such as 'blanket-red'.
 */
function addToFort(emoji, type) {
    gameState.fortItems.push({ emoji, type });
    renderFort();
}

/**
 * Redraw the list of fort items on the build screen.
 */
// Look up the two page elements we need to change.
function renderFort() {
    const container = document.getElementById('fort-items');
    const hint = document.getElementById('fort-hint');

    // Once something is placed, hide the 'drop items here' hint.
    if (gameState.fortItems.length > 0) {
        hint.style.display = 'none';
    }

    // Turn each item into a clickable <span>; clicking it removes that item.
    // join('') glues all the pieces into one string of HTML.
    container.innerHTML = gameState.fortItems.map((item, i) =>
        `<span class="fort-item" onclick="removeFortItem(${i})" title="Click to remove">${item.emoji}</span>`
    ).join('');
}

/**
 * Remove one item from the fort by its position in the list.
 * @param {number} index
 */
// splice(index, 1) deletes exactly one entry at that position.
function removeFortItem(index) {
    gameState.fortItems.splice(index, 1);
    renderFort();
    // If the fort is now empty, show the hint again.
    if (gameState.fortItems.length === 0) {
        document.getElementById('fort-hint').style.display = 'block';
    }
}

// ==================== TOYS ====================
/**
 * Draw all 40 toy cards, marking the ones already chosen.
 */
function renderToyGrid() {
    const grid = document.getElementById('toy-grid');
    grid.innerHTML = allToys.map((toy, i) => {
        // some() answers true if any chosen toy has the same emoji as this one.
        const selected = gameState.selectedToys.some(t => t.emoji === toy.emoji);
        // Build one card; the 'selected' class is added only for chosen toys.
        return `<div class="toy-card ${selected ? 'selected' : ''}" onclick="toggleToy(${i})">
            <span class="toy-emoji">${toy.emoji}</span>
            <span class="toy-name">${toy.name}</span>
        </div>`;
    }).join('');
    // Also refresh the 'Your Toys' basket under the grid.
    renderToyBasket();
}

/**
 * Pick a toy if it is not chosen yet, or un-pick it if it is.
 * @param {number} index - position of the toy in allToys.
 */
function toggleToy(index) {
    const toy = allToys[index];
    // findIndex gives the position in selectedToys, or -1 if it is not there.
    const existing = gameState.selectedToys.findIndex(t => t.emoji === toy.emoji);
    // Already chosen: remove it. Otherwise: add it.
    if (existing >= 0) {
        gameState.selectedToys.splice(existing, 1);
    } else {
        gameState.selectedToys.push(toy);
    }
    renderToyGrid();
}

/**
 * Update the toy counter and the row of chosen toy emoji.
 */
function renderToyBasket() {
    const basket = document.getElementById('toy-basket');
    const count = document.getElementById('toy-count');
    // Show how many toys are chosen.
    count.textContent = gameState.selectedToys.length;
    // Show one emoji per chosen toy.
    basket.innerHTML = gameState.selectedToys.map(t =>
        `<span class="basket-item">${t.emoji}</span>`
    ).join('');
}

// ==================== CHARACTER CREATOR ====================
/**
 * Draw the option buttons for hair, face, outfit and shoes.
 */
// Go through each category name in charOptions.
function renderCharacterOptions() {
    Object.keys(charOptions).forEach(category => {
        // Find that category's row on the page (for example 'hair-options').
        const row = document.getElementById(category + '-options');
        row.innerHTML = charOptions[category].map(opt => {
            // A button is highlighted when it matches the current choice.
            const selected = gameState.character[category] === opt;
            return `<button class="option-btn ${selected ? 'selected' : ''}"
                onclick="selectOption('${category}', '${opt}')">${opt}</button>`;
        }).join('');
    });
    // Refresh the big preview picture too.
    updateCharacterPreview();
}

/**
 * Save a clicked option and redraw the buttons.
 * @param {string} category - hair, face, outfit or shoes.
 * @param {string} value - the emoji picked.
 */
function selectOption(category, value) {
    gameState.character[category] = value;
    renderCharacterOptions();
}

/**
 * Copy the chosen emoji into the preview boxes on the page.
 */
function updateCharacterPreview() {
    document.getElementById('char-hair').textContent = gameState.character.hair;
    document.getElementById('char-face').textContent = gameState.character.face;
    document.getElementById('char-outfit').textContent = gameState.character.outfit;
    document.getElementById('char-shoes').textContent = gameState.character.shoes;
}

// ==================== PLAY MODE ====================
/**
 * Draw everything on the play screen: roof, background, avatar and toys.
 */
// Show the fort items along the roof, or a default label if there are none.
function renderPlayScene() {
    const fortRoof = document.getElementById('fort-roof');
    fortRoof.innerHTML = gameState.fortItems.map(i => i.emoji).join(' ') || '~ Your Fort ~';

    // (the colors below are dark versions matching each blanket)
    // Set fort background colors based on blankets used
    const scene = document.getElementById('fort-scene');
    // Maps a blanket type to a dark background color.
    const blanketColors = {
        'blanket-red': '#4a1a1a',
        'blanket-blue': '#1a1a4a',
        'blanket-purple': '#2d1b4e',
        'blanket-green': '#1a4a1a',
        'blanket-yellow': '#4a4a1a',
        'blanket-rainbow': '#2d1b4e'
    };
    // Use the first blanket found in the fort, if any.
    const blanket = gameState.fortItems.find(i => i.type && i.type.startsWith('blanket'));
    // Only change the background when a known blanket color exists.
    if (blanket && blanketColors[blanket.type]) {
        scene.style.background = `linear-gradient(180deg, ${blanketColors[blanket.type]} 0%, #4a2d6e 100%)`;
    }

    // (the avatar is three stacked emoji: hair, face, outfit)
    // Render character
    const player = document.getElementById('player-character');
    player.innerHTML = `
        <div style="font-size:0.5em">${gameState.character.hair}</div>
        <div>${gameState.character.face}</div>
        <div style="font-size:0.7em">${gameState.character.outfit}</div>
    `;

    // Each toy gets a staggered animation delay so they float out of sync.
    // Clicking a toy calls interactToy with its name and emoji.
    // Render toys
    const toyArea = document.getElementById('placed-toys');
    toyArea.innerHTML = gameState.selectedToys.map((t, i) =>
        `<span class="placed-toy" style="animation-delay: ${i * 0.3}s"
            onclick="interactToy('${t.name}', '${t.emoji}')">${t.emoji}</span>`
    ).join('');
}

/**
 * Move the avatar one step, staying inside the fort walls.
 * @param {string} direction - 'left', 'right', 'up' or 'down'.
 */
// How far to move per press, in percent.
function moveCharacter(direction) {
    const step = 8;
    // Math.max/min clamp the position so it never leaves the allowed range.
    switch(direction) {
        case 'left': gameState.charX = Math.max(10, gameState.charX - step); break;
        case 'right': gameState.charX = Math.min(90, gameState.charX + step); break;
        case 'up': gameState.charY = Math.max(15, gameState.charY - step); break;
        case 'down': gameState.charY = Math.min(85, gameState.charY + step); break;
    }
    const player = document.getElementById('player-character');
    // Apply the new position using CSS percentages.
    player.style.left = gameState.charX + '%';
    player.style.top = gameState.charY + '%';
}

/**
 * Run one of the action buttons: wave, dance, jump or sleep.
 * @param {string} action
 */
// The emoji shown in the popup for each action.
function doAction(action) {
    const emojis = {
        wave: '👋',
        dance: '💃🕺',
        jump: '⬆️✨',
        sleep: '💤😴'
    };
    // Show the popup, with a sparkle fallback for unknown actions.
    showPopup(emojis[action] || '✨');

    // Dance: wiggle left and right a few times using a timer.
    if (action === 'dance') {
        const player = document.getElementById('player-character');
        player.style.transition = 'transform 0.2s';
        // Every 200 ms, tilt the avatar the opposite way.
        let count = 0;
        const dance = setInterval(() => {
            player.style.transform = count % 2 === 0
                ? 'translate(-50%, -50%) rotate(10deg) scale(1.1)'
                : 'translate(-50%, -50%) rotate(-10deg) scale(1.1)';
            count++;
            // After about seven wiggles, stop the timer and stand straight again.
            if (count > 6) {
                clearInterval(dance);
                player.style.transform = 'translate(-50%, -50%)';
            }
        }, 200);
    }

    // Jump: lift the avatar up 40px, then drop it back after 0.4 seconds.
    if (action === 'jump') {
        const player = document.getElementById('player-character');
        player.style.transition = 'transform 0.3s ease';
        player.style.transform = 'translate(-50%, -50%) translateY(-40px)';
        setTimeout(() => {
            player.style.transform = 'translate(-50%, -50%)';
        }, 400);
    }
}

/**
 * Show a popup when a toy is clicked.
 * @param {string} name
 * @param {string} emoji
 */
function interactToy(name, emoji) {
    showPopup(emoji + ' ' + name + '!');
}

/**
 * Show a short animated popup in the middle of the screen.
 * @param {string} text
 */
// Put the text in and make the popup visible.
function showPopup(text) {
    const popup = document.getElementById('action-popup');
    popup.textContent = text;
    popup.classList.remove('hidden');
    // Restart the animation: clear it, force a reflow, then set it again.
    popup.style.animation = 'none';
    popup.offsetHeight; // trigger reflow
    popup.style.animation = 'popUp 1s ease forwards';
    // Hide the popup after one second.
    setTimeout(() => popup.classList.add('hidden'), 1000);
}

// ==================== KEYBOARD CONTROLS ====================
// Keyboard controls: arrows or WASD to move, space to jump.
// Ignore keys unless the play screen is the one showing.
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
/**
 * Open the tablet screen.
 */
function openTablet() {
    showScreen('tablet-screen');
}

/**
 * Close the tablet and return to the play screen.
 */
function closeTablet() {
    showScreen('play-screen');
    renderPlayScene();
}

/**
 * Leave a mini-game and show the app icons again.
 */
function backToApps() {
    document.getElementById('tablet-game').classList.add('hidden');
    document.getElementById('app-grid').style.display = 'grid';
}

/**
 * Hide the app icons and start the chosen mini-game.
 * @param {string} gameType - 'math', 'spelling', etc.
 */
// Hide the icon grid and show the game panel.
function playTabletGame(gameType) {
    document.getElementById('app-grid').style.display = 'none';
    const gameDiv = document.getElementById('tablet-game');
    gameDiv.classList.remove('hidden');
    const area = document.getElementById('game-area');

    // Pick the starter function that matches the app name.
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

// Each mini-game below is a function that fills `area` with HTML and keeps its own score.
// --- Math Game ---
/**
 * Math mini-game: pick the right answer to a small add or subtract question.
 * @param {HTMLElement} area - the box the game draws into.
 */
function startMathGame(area) {
    // Number of correct answers so far.
    let score = 0;
    // Make and show one new question.
    function newQuestion() {
        // Two random numbers from 1 to 10.
        const a = Math.floor(Math.random() * 10) + 1;
        const b = Math.floor(Math.random() * 10) + 1;
        // Randomly choose plus or minus.
        const ops = ['+', '-'];
        const op = ops[Math.floor(Math.random() * ops.length)];
        // The right answer.
        const answer = op === '+' ? a + b : a - b;
        // Two wrong answers that are close to the right one.
        const wrong1 = answer + Math.floor(Math.random() * 3) + 1;
        const wrong2 = answer - Math.floor(Math.random() * 3) - 1;
        // Mix the three choices into random order.
        // (sort with a random compare is a quick shuffle, not a perfect one)
        const choices = [answer, wrong1, wrong2].sort(() => Math.random() - 0.5);

        // Draw the question and the answer buttons.
        area.innerHTML = `
            <h3>🔢 Math Fun!</h3>
            <div class="score-display">Score: ${score}</div>
            <div class="game-question">${a} ${op} ${b} = ?</div>
            <div class="game-choices">
                ${choices.map(c => `<button class="game-choice" onclick="checkMathAnswer(this, ${c}, ${answer})">${c}</button>`).join('')}
            </div>
        `;
    }
    // Made global (on window) so the onclick text inside the HTML can find it.
    window.checkMathAnswer = function(btn, chosen, correct) {
        // Right answer: mark green, add a point, ask a new question soon.
        // Wrong answer: flash red briefly.
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
/**
 * Spelling mini-game: click scrambled letters in order to spell the word.
 * @param {HTMLElement} area
 */
// The word list, each with a hint.
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
    // The letters the player has clicked so far.
    let current = [];

    // Choose a random word and show its scrambled letters.
    function newWord() {
        // Pick a random word and clear the player's letters.
        const w = words[Math.floor(Math.random() * words.length)];
        current = [];
        // Split the word into letters and shuffle them.
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

    // Called when a letter button is clicked: add it to the answer and hide the button.
    window.pickLetter = function(letter, index, correctWord) {
        current.push(letter);
        document.getElementById('sl-' + index).style.visibility = 'hidden';
        document.getElementById('spell-answer').textContent = current.join(' ');

        // When all letters are used, check the answer.
        // Either way a new word comes after one second; only a correct word scores.
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
/**
 * Colors mini-game: name the color of a circle.
 * @param {HTMLElement} area
 */
// The colors: a name, a CSS color code, and an emoji.
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

    // Choose the right color and two different wrong ones, then shuffle.
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

    // Global so the button onclick can call it; same right/wrong pattern as the math game.
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
/**
 * Counting mini-game: count how many emoji are shown.
 * @param {HTMLElement} area
 */
function startCountingGame(area) {
    // Emoji that can be counted.
    const items = ['🍎', '🌟', '🐟', '🦋', '🎈', '🍪', '🌸', '🐝'];
    let score = 0;

    function newRound() {
        // Pick one emoji and a count of 2 to 9, then repeat the emoji that many times.
        const emoji = items[Math.floor(Math.random() * items.length)];
        const count = Math.floor(Math.random() * 8) + 2;
        const display = Array(count).fill(emoji).join(' ');
        const wrong1 = count + Math.floor(Math.random() * 2) + 1;
        const wrong2 = Math.max(1, count - Math.floor(Math.random() * 2) - 1);
        // Set removes duplicate numbers so two buttons never show the same value.
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

    // Check the clicked number against the real count.
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
/**
 * Shapes mini-game: name the shape that is shown.
 * @param {HTMLElement} area
 */
// Each shape has a name, a text symbol, and CSS that draws it (empty css means use the symbol).
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

        // Draw with CSS when we have it, otherwise show the emoji symbol.
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

    // Check the clicked shape name.
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
/**
 * Animals mini-game: match an animal with its sound or picture.
 * @param {HTMLElement} area
 */
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

        // (the question is either 'who says this sound' or 'what animal is this')
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

    // Check the clicked animal name.
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
/**
 * Music mini-game: a row of keys that play notes.
 * @param {HTMLElement} area
 */
// Each note has a letter, a color and a frequency in hertz (pitch).
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

    // Web Audio context, created on the first key press (browsers want a user action first).
    let audioCtx = null;
    // Play a short sine-wave tone at the given frequency.
    window.playNote = function(freq, btn) {
        // Create the audio system the first time.
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        // An oscillator makes the tone; a gain node controls volume.
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        // Start at 0.3 volume and fade out over half a second.
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
        // Start the tone and stop it after 0.5 seconds.
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);

        // Briefly shrink and brighten the key so it looks pressed.
        btn.style.transform = 'scale(0.95)';
        btn.style.filter = 'brightness(1.3)';
        setTimeout(() => {
            btn.style.transform = '';
            btn.style.filter = '';
        }, 200);
    };
}

// --- Drawing Game ---
/**
 * Drawing mini-game: draw on a canvas with a chosen color.
 * @param {HTMLElement} area
 */
// Available pen colors.
function startDrawingGame(area) {
    const colors = ['#000000', '#ff4444', '#ff8800', '#ffcc00', '#44aa44', '#4444ff', '#aa44ff', '#ff44aa', '#ffffff'];
    // The pen color in use.
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

    // Get the canvas and its 2D drawing tool, then paint it white and set the pen.
    const canvas = document.getElementById('draw-canvas');
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.strokeStyle = currentColor;

    // True while the mouse button or finger is held down.
    let drawing = false;

    // Convert a mouse or touch position into canvas coordinates (accounts for CSS scaling).
    function getPos(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: (clientX - rect.left) * (canvas.width / rect.width),
            y: (clientY - rect.top) * (canvas.height / rect.height)
        };
    }

    // Mouse: start a line on press, extend it on move, stop on release or leaving.
    canvas.addEventListener('mousedown', (e) => { drawing = true; const p = getPos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); });
    canvas.addEventListener('mousemove', (e) => { if (!drawing) return; const p = getPos(e); ctx.lineTo(p.x, p.y); ctx.stroke(); });
    canvas.addEventListener('mouseup', () => drawing = false);
    canvas.addEventListener('mouseleave', () => drawing = false);

    // Touch: the same steps, with preventDefault so the page does not scroll.
    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); drawing = true; const p = getPos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); });
    canvas.addEventListener('touchmove', (e) => { e.preventDefault(); if (!drawing) return; const p = getPos(e); ctx.lineTo(p.x, p.y); ctx.stroke(); });
    canvas.addEventListener('touchend', () => drawing = false);

    // Change the pen color and move the highlight to the clicked dot.
    window.setDrawColor = function(color, dot) {
        currentColor = color;
        ctx.strokeStyle = color;
        document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
    };

    // Wipe the canvas back to white.
    window.clearCanvas = function() {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = currentColor;
    };
}

// ==================== INIT ====================
// Wait until the page is fully loaded, then wire up drag and drop.
document.addEventListener('DOMContentLoaded', () => {
    setupDragAndDrop();
});
