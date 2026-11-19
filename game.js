// ==============================================================================
// Program: game.js
// Program: Fort Builder
// Programmer: Ethan-da-Tech-Wizard
// Programmer: Ethan Kilmer
// Last Modified: November 18, 2026
// Purpose: Interactive browser game for building personalized blanket forts, selecting
//          custom toy loadouts, customizing player characters, and engaging in 8 embedded
//          educational mini-games (Math, Spelling, Colors, Counting, Shapes, Animals, Music, Drawing).
// ==============================================================================
//
// How it fits: this is the only script index.html loads (a classic <script>, not a module,
//   so every top-level function below is a global that the inline onclick="..." attributes
//   in index.html call by name). style.css owns all visuals; this file only toggles the
//   `.screen.active`, `.hidden`, `.selected` and similar state classes and builds markup.
//   There is no build step, no storage and no network: a page refresh resets everything.
//
// Flow of the game (each step is one `.screen` element in index.html):
//   title-screen -> build-screen (place blankets/pillows/lights) -> toys-screen (pick toys)
//   -> character-screen (avatar + name) -> play-screen (walk around, click toys, do actions)
//   -> tablet-screen (eight mini-games rendered into #game-area).
//
// Design decisions: markup is produced with template-string innerHTML for brevity; all of
//   the interpolated values come from constant tables in this file (emoji, toy names, game
//   words), except the player's typed name, which is only ever written via textContent.
//   Mini-game handlers are attached to `window` because the generated buttons use inline
//   onclick, which resolves names in the global scope.
//
// Known limits: no persistence, no sound except the Music game, and the toy names are
//   interpolated into inline onclick strings, so a toy name containing a quote would break
//   them (the current catalogue has none).
//
// Test: tests/test_fort_builder.py only greps this file's source text (catalogue size,
//   that each function exists, header text); it does not execute the game logic. Run
//   `python3 -m unittest discover -s tests`, and open index.html in a browser for real play.
// ==============================================================================

// ==================== CORE GAME STATE ====================
// Tracks fort structure elements, selected toy inventory, avatar customization, and 2D spatial positioning
// Single mutable object holding everything the game remembers. There is no
// persistence: refreshing the page starts over. charX/charY are percentages of
// the play scene so the layout works at any screen size.
const gameState = {
    fortItems: [],      // Array of placed blankets, pillows, and decorative lights
    selectedToys: [],   // Array of active toys selected from the toy box to bring into the fort
    character: {        // Avatar customization properties (hair style, facial expression, shirt, shoes, name)
        hair: '👱',
        face: '😊',
        outfit: '👕',
        shoes: '👟',
        name: ''
    },
    charX: 50,          // Current avatar X coordinate inside the fort room (percentage based)
    charY: 50           // Current avatar Y coordinate inside the fort room (percentage based)
};

// ==================== COMPREHENSIVE TOY CATALOG ====================
// Exhaustive list of 40 interactive toys with emojis and descriptive titles
// Toy box contents. Each entry's emoji is its identity: selection and
// de-duplication elsewhere compare emoji, so every emoji here must be unique.
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
// Choices offered per avatar slot. The keys (hair, face, outfit, shoes) must
// match both gameState.character and the '<key>-options' element ids in
// index.html, because renderCharacterOptions builds those ids from the keys.
const charOptions = {
    hair: ['👱', '👩', '👨', '🧑', '👧', '👦', '👩‍🦰', '👨‍🦰', '👩‍🦱', '👱‍♀️'],
    face: ['😊', '😄', '😎', '🥰', '😋', '🤩', '😺', '🤠', '🥳', '😁'],
    outfit: ['👕', '👗', '🥋', '🦸', '👸', '🧙', '🧚', '🦹', '🥷', '🤴'],
    shoes: ['👟', '👠', '👢', '🥾', '👡', '🩴', '⛸️', '🛼', '👞', '🥿']
};

// ==================== SCREEN NAVIGATION ====================
// Only one element with class "screen" is visible at a time (the one with
// class "active"). All navigation goes through this function.
/**
 * Makes exactly one screen visible by moving the `active` class (CSS shows only
 * `.screen.active`).
 *
 * @param {string} id - DOM id of the target `.screen` element, for example 'play-screen'.
 *   An unknown id throws a TypeError at classList because getElementById returns null;
 *   all callers pass literals defined in index.html.
 * @returns {void}
 */
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

/**
 * Title-screen "Start" button handler (index.html onclick): moves on to fort building.
 * @returns {void}
 */
function startGame() {
    showScreen('build-screen');
}

// Toy screen needs its grid built each time it is shown so selections persist.
/**
 * Build-screen "next" handler: shows the toy picker and rebuilds its grid so earlier
 * selections appear highlighted.
 * @returns {void}
 */
function goToToys() {
    showScreen('toys-screen');
    renderToyGrid();
}

/**
 * Toy-screen "next" handler: shows the avatar creator and redraws its option rows so the
 * current choices are highlighted.
 * @returns {void}
 */
function goToCharacter() {
    showScreen('character-screen');
    renderCharacterOptions();
}

// Leaving the character screen: fall back to the name "Player" when the name
// box is empty, then build the play scene from the current state.
/**
 * Character-screen "next" handler: stores the typed name, shows the play screen and
 * builds the scene.
 *
 * Side effects: writes gameState.character.name and the #fort-title text. The name is
 * inserted with textContent so a typed `<script>` is displayed, not executed.
 * @returns {void}
 */
function goToPlay() {
    gameState.character.name = document.getElementById('char-name').value || 'Player';
    showScreen('play-screen');
    document.getElementById('fort-title').textContent =
        gameState.character.name + "'s Fort!";
    renderPlayScene();
}

/**
 * Returns to the title screen. Does NOT clear gameState, so pressing Start again keeps the
 * fort, toys and avatar built so far (a deliberate "continue editing" behaviour).
 * @returns {void}
 */
function goToTitle() {
    showScreen('title-screen');
}

// ==================== FORT BUILDING ====================
// Wire up the fort-building palette. Three input styles are supported: desktop
// drag-and-drop, touch (tap a material), and plain click. All three end in
// addToFort(). Called once on DOMContentLoaded (see bottom of file).
/**
 * Attaches input handlers to the material palette and the fort drop area.
 *
 * Why three input styles: HTML5 drag-and-drop does not fire on touch screens, and a plain
 * click is the easiest path for small children, so each material also handles touch and
 * click. All of them end in addToFort(). Elements are found by the `.material` class and
 * the #fort-area id from index.html; materials carry their identity in data-emoji and
 * data-type attributes.
 *
 * @returns {void}
 */
function setupDragAndDrop() {
    const materials = document.querySelectorAll('.material');
    const fortArea = document.getElementById('fort-area');

    materials.forEach(mat => {
        // Smuggle the material's emoji and type through the drag so the drop handler can
        // rebuild the item. 'text/plain' is the one type every browser accepts; the custom
        // 'type' key is allowed by the DataTransfer API but ignored by external drop targets.
        mat.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', mat.dataset.emoji);
            e.dataTransfer.setData('type', mat.dataset.type);
        });

        // Touch support. passive:false is required so handleTouch* may call preventDefault();
        // passive listeners silently ignore it, and the page would scroll or double-fire a click.
        mat.addEventListener('touchstart', handleTouchStart, { passive: false });
        mat.addEventListener('touchmove', handleTouchMove, { passive: false });
        mat.addEventListener('touchend', handleTouchEnd, { passive: false });

        // Click to add: the simplest path, and the one keyboard/mouse-only users use.
        mat.addEventListener('click', () => {
            addToFort(mat.dataset.emoji, mat.dataset.type);
        });
    });

    // A drop is only permitted if dragover is cancelled with preventDefault(); the
    // `drag-over` class lets style.css highlight the target while an item hovers over it.
    fortArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        fortArea.classList.add('drag-over');
    });

    fortArea.addEventListener('dragleave', () => {
        fortArea.classList.remove('drag-over');
    });

    // On drop, read back what dragstart stored and add it exactly like a click would.
    fortArea.addEventListener('drop', (e) => {
        e.preventDefault();
        fortArea.classList.remove('drag-over');
        const emoji = e.dataTransfer.getData('text/plain');
        const type = e.dataTransfer.getData('type');
        addToFort(emoji, type);
    });
}

// Material most recently touched; touch events do not support HTML5 drag
// and drop, so a touch is treated as "add this material" on touchend.
let touchDragElement = null;

// preventDefault stops the browser scrolling/emulating a mouse click, which
// would otherwise add the item twice.
/**
 * touchstart on a material: remembers which material was touched.
 * @param {TouchEvent} e - e.target may be a child span, hence closest('.material').
 * @returns {void}
 */
function handleTouchStart(e) {
    e.preventDefault();
    touchDragElement = e.target.closest('.material');
}

/**
 * touchmove on a material: swallowed so a slightly moving finger does not scroll the page
 * or cancel the tap. No drag preview is drawn; the add happens on touchend.
 * @param {TouchEvent} e
 * @returns {void}
 */
function handleTouchMove(e) {
    e.preventDefault();
}

/**
 * touchend: adds the remembered material (a tap) and clears the memory so a second
 * touchend with no preceding touchstart cannot add a ghost item.
 * @param {TouchEvent} e - unused; the element comes from touchDragElement.
 * @returns {void}
 */
function handleTouchEnd(e) {
    if (touchDragElement) {
        addToFort(touchDragElement.dataset.emoji, touchDragElement.dataset.type);
        touchDragElement = null;
    }
}

/**
 * Appends one item to the fort and redraws. Duplicates are allowed on purpose (a fort can
 * have many red blankets).
 *
 * @param {string} emoji - glyph shown in the fort (from data-emoji).
 * @param {string} type - material key such as 'blanket-red' (from data-type); the play
 *   scene uses its 'blanket' prefix to pick the background colour.
 * @returns {void}
 */
function addToFort(emoji, type) {
    gameState.fortItems.push({ emoji, type });
    renderFort();
}

// Rebuild the fort item list from state and hide the "drag items here" hint
// once something is placed. Clicking an item removes it by index.
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

// Remove by array index, then restore the hint if the fort is now empty.
/**
 * Called from the inline onclick that renderFort writes on each item.
 * @param {number} index - position in gameState.fortItems of the clicked item. Indexes
 *   are re-issued by every renderFort, so they are never stale at click time.
 * @returns {void}
 */
function removeFortItem(index) {
    gameState.fortItems.splice(index, 1);
    renderFort();
    if (gameState.fortItems.length === 0) {
        document.getElementById('fort-hint').style.display = 'block';
    }
}

// ==================== TOYS ====================
// Draw all toys; a card is marked selected when its emoji is in selectedToys.
/**
 * Redraws the 40-toy grid and the basket below it.
 * Identity is by emoji (see allToys), so a toy is "selected" when its emoji already
 * appears in gameState.selectedToys. Each card's onclick passes the index into allToys.
 * @returns {void}
 */
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

// Add the toy if absent, remove it if already selected, then redraw.
/**
 * Select or deselect one toy.
 * @param {number} index - position in allToys, 0 to allToys.length - 1.
 * @returns {void}
 */
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

// Show the chosen toys and their count under the grid.
/**
 * Updates the #toy-count number and the basket of chosen emoji under the toy grid.
 * Called only from renderToyGrid, so the two always stay in step.
 * @returns {void}
 */
function renderToyBasket() {
    const basket = document.getElementById('toy-basket');
    const count = document.getElementById('toy-count');
    count.textContent = gameState.selectedToys.length;
    basket.innerHTML = gameState.selectedToys.map(t =>
        `<span class="basket-item">${t.emoji}</span>`
    ).join('');
}

// ==================== CHARACTER CREATOR ====================
// One row of buttons per slot, with the current choice highlighted.
/**
 * Redraws every avatar option row (#hair-options, #face-options, #outfit-options,
 * #shoes-options) and the live preview. Iterates charOptions keys, so adding a slot there
 * needs a matching '<slot>-options' container in index.html.
 * @returns {void}
 */
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

/**
 * Option-button handler: stores a choice and redraws so the highlight moves.
 * @param {'hair'|'face'|'outfit'|'shoes'} category - key of gameState.character.
 * @param {string} value - the emoji picked; it is also written into the button's inline
 *   onclick, which works because emoji contain no quote characters.
 * @returns {void}
 */
function selectOption(category, value) {
    gameState.character[category] = value;
    renderCharacterOptions();
}

/**
 * Copies the current choices into the four stacked preview spans (#char-hair, #char-face,
 * #char-outfit, #char-shoes) on the character screen.
 * @returns {void}
 */
function updateCharacterPreview() {
    document.getElementById('char-hair').textContent = gameState.character.hair;
    document.getElementById('char-face').textContent = gameState.character.face;
    document.getElementById('char-outfit').textContent = gameState.character.outfit;
    document.getElementById('char-shoes').textContent = gameState.character.shoes;
}

// ==================== PLAY MODE ====================
// Build the play screen from state: roof text from fort items, a background
// tint taken from the first blanket placed, the avatar (hair/face/outfit
// stacked), and clickable toys with staggered animation delays.
/**
 * (Re)builds the whole play scene from gameState. Called when entering play and when
 * returning from the tablet, because the tablet screens replace the visible DOM.
 *
 * Side effects: sets innerHTML of #fort-roof, #player-character and #placed-toys and, if a
 * blanket was placed, the background of #fort-scene. It does not reset charX/charY, so the
 * avatar stays where the player left it.
 * @returns {void}
 */
function renderPlayScene() {
    const fortRoof = document.getElementById('fort-roof');
    fortRoof.innerHTML = gameState.fortItems.map(i => i.emoji).join(' ') || '~ Your Fort ~';

    // Only the FIRST blanket placed tints the room (the scene has a single background);
    // with no blanket the stylesheet's default background stays.
    const scene = document.getElementById('fort-scene');
    // Item type (data-type of a blanket material) -> dark background colour.
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

    // Stack hair, face and outfit vertically; the em sizes shrink hair/outfit so the face
    // stays the focal point. Emoji come from charOptions, so this innerHTML is trusted.
    const player = document.getElementById('player-character');
    player.innerHTML = `
        <div style="font-size:0.5em">${gameState.character.hair}</div>
        <div>${gameState.character.face}</div>
        <div style="font-size:0.7em">${gameState.character.outfit}</div>
    `;

    // One clickable emoji per chosen toy. The 0.3s per-index animation delay staggers the
    // CSS bobbing animation so toys do not move in lockstep.
    const toyArea = document.getElementById('placed-toys');
    toyArea.innerHTML = gameState.selectedToys.map((t, i) =>
        `<span class="placed-toy" style="animation-delay: ${i * 0.3}s"
            onclick="interactToy('${t.name}', '${t.emoji}')">${t.emoji}</span>`
    ).join('');
}

/**
 * Moves the avatar one step. Positions are percentages of #fort-scene so the movement
 * scales with screen size. Called by the on-screen arrow buttons and the keyboard handler.
 *
 * @param {'left'|'right'|'up'|'down'} direction - any other string is ignored.
 * @returns {void} Mutates gameState.charX/charY and the avatar's inline left/top.
 */
function moveCharacter(direction) {
    // 8% of the scene per press: about 12 presses cross the room, big enough to feel quick
    // for a child, small enough to look like walking rather than teleporting.
    const step = 8;
    // Clamp to the interior of the fort: X in [10%, 90%], Y in [15%, 85%]. The Y margins are
    // larger at the top because the roof sits there. Math.max/min stop the avatar at a wall.
    switch(direction) {
        case 'left': gameState.charX = Math.max(10, gameState.charX - step); break;
        case 'right': gameState.charX = Math.min(90, gameState.charX + step); break;
        case 'up': gameState.charY = Math.max(15, gameState.charY - step); break;
        case 'down': gameState.charY = Math.min(85, gameState.charY + step); break;
    }
    // The avatar is absolutely positioned; CSS translate(-50%, -50%) centres it on this point.
    const player = document.getElementById('player-character');
    player.style.left = gameState.charX + '%';
    player.style.top = gameState.charY + '%';
}

/**
 * Plays one avatar action: shows an emoji popup and, for dance and jump, animates the
 * avatar with inline CSS transforms.
 *
 * @param {'wave'|'dance'|'jump'|'sleep'} action - unknown values show a generic sparkle.
 *   wave and sleep are popup-only.
 * @returns {void}
 */
function doAction(action) {
    const emojis = {
        wave: '👋',
        dance: '💃🕺',
        jump: '⬆️✨',
        sleep: '💤😴'
    };
    showPopup(emojis[action] || '✨');

    // Dance: toggle between +10 and -10 degrees every 200ms for 7 ticks (~1.4s), then
    // reset. Every transform repeats translate(-50%, -50%) because setting `transform`
    // replaces the centring translate; omitting it would make the avatar jump off position.
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

    // Jump: lift 40px, then drop back after 400ms. The CSS transition (0.3s ease) supplies
    // the smooth up/down motion, so no per-frame code is needed.
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
 * Click handler for a toy in the play scene: shows "<emoji> <name>!" in the popup.
 * @param {string} name - toy display name.
 * @param {string} emoji - toy glyph.
 * @returns {void}
 */
function interactToy(name, emoji) {
    showPopup(emoji + ' ' + name + '!');
}

// Show a short floating message. Removing and re-adding the animation (with a
// forced reflow in between) restarts the CSS animation even if a popup is
// still visible from a previous call.
/**
 * @param {string} text - message for #action-popup; shown for 1 second (matches the
 *   `popUp` keyframe duration in style.css and the hide timeout below).
 * @returns {void}
 */
function showPopup(text) {
    const popup = document.getElementById('action-popup');
    popup.textContent = text;
    popup.classList.remove('hidden');
    popup.style.animation = 'none';
    // Reading offsetHeight forces layout; without it the browser batches the two animation
    // writes into one and the animation would not restart.
    popup.offsetHeight; // trigger reflow
    popup.style.animation = 'popUp 1s ease forwards';
    setTimeout(() => popup.classList.add('hidden'), 1000);
}

// ==================== KEYBOARD CONTROLS ====================
// Keyboard controls apply only while the play screen is showing: arrow keys or
// WASD move the avatar, Space makes it jump.
// A single global listener (installed at load) rather than one per screen. The early
// return avoids moving the avatar, or jumping on Space, while typing a name on the
// character screen.
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
// Tablet is a mini app launcher inside the play screen: each app is one of the
// educational games below, rendered into #game-area.
/**
 * "Tablet" button in the play screen: opens the app launcher.
 * @returns {void}
 */
function openTablet() {
    showScreen('tablet-screen');
}

/**
 * Leaves the tablet and rebuilds the play scene (see renderPlayScene for why).
 * @returns {void}
 */
function closeTablet() {
    showScreen('play-screen');
    renderPlayScene();
}

/**
 * "Back" inside a mini-game: hides the game and shows the app grid again. The old game's
 * window.* handlers are left in place; the next game simply overwrites them.
 * @returns {void}
 */
function backToApps() {
    document.getElementById('tablet-game').classList.add('hidden');
    document.getElementById('app-grid').style.display = 'grid';
}

// Dispatch to the game starter named by the app button's data.
/**
 * App-icon handler: swaps the launcher for #tablet-game and starts the chosen game.
 * @param {string} gameType - one of the data-game keys in index.html: math, spelling,
 *   colors, counting, shapes, animals, music, drawing. Unknown keys leave an empty game
 *   panel.
 * @returns {void}
 */
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
// Each game below follows the same pattern: keep a local score, render a new
// question into `area` with innerHTML, and register a global handler (on
// window) that the generated buttons call via inline onclick; a correct
// answer increments the score and shows the next question after a short delay.
// Math: single-digit +/- questions with the right answer and two nearby wrong
// ones, shuffled.
/**
 * Math mini-game: endless single-digit addition/subtraction with three answers.
 *
 * Wrong answers are the right answer offset by 1-3 up and 1-3 down, so they are plausible
 * but never equal the answer. The sort(() => random - 0.5) shuffle is biased but fine for
 * three buttons. Subtraction may give a negative answer (for example 2 - 9); that is
 * accepted as a stretch problem. Rare collisions between the two wrong values and the
 * answer cannot occur because one is above and one below.
 *
 * @param {HTMLElement} area - #game-area; its innerHTML is replaced on every question.
 * @returns {void}
 */
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
    // Answer handler called by the buttons' inline onclick. A wrong tap only flashes red
    // for 500ms so the child can try again; a right tap scores and moves on after 800ms
    // (long enough to see the green flash).
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
// Spelling: letters of a word are shuffled; the child taps them in order to
// spell it. After the last letter the answer is coloured and a new word loads
// either way (a wrong spelling gets no score).
/**
 * Spelling mini-game: unscramble a 3-4 letter word by tapping letters in order.
 *
 * @param {HTMLElement} area - #game-area, rewritten for each word.
 * @returns {void}
 */
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
    // Letters the child has tapped so far for the current word (reset by newWord).
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

    // Each letter button hides itself when tapped (visibility keeps the layout from
    // shifting) and the typed letters are shown spaced. When the count matches the word
    // length the attempt is judged: blue for correct (and +1), red for wrong; either way
    // a new word loads after 1s.
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
// Colors: show a swatch and three named choices (one correct).
/**
 * Colors mini-game: name the colour of a circle from three choices.
 * @param {HTMLElement} area - #game-area, rewritten each round.
 * @returns {void}
 */
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

    // Pick the answer, then two distinct distractors (filter removes the answer first, so
    // a choice can never repeat), then shuffle all three.
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

    // Same correct/wrong feedback pattern as the Math game.
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
// Counting: show 2-9 repeated emoji; Set() removes duplicate choices when a
// wrong option collides with the right count.
/**
 * Counting mini-game: count 2-9 identical emoji and pick the number.
 * @param {HTMLElement} area - #game-area, rewritten each round.
 * @returns {void}
 */
function startCountingGame(area) {
    const items = ['🍎', '🌟', '🐟', '🦋', '🎈', '🍪', '🌸', '🐝'];
    let score = 0;

    function newRound() {
        const emoji = items[Math.floor(Math.random() * items.length)];
        // 2..9 inclusive: one item is too trivial and ten no longer fits on one line.
        const count = Math.floor(Math.random() * 8) + 2;
        const display = Array(count).fill(emoji).join(' ');
        // Distractors are 1-2 above and 1-2 below (floored at 1), so they are close to the
        // true count. Set() drops duplicates when the floor makes wrong2 repeat, which is why
        // some rounds offer only two buttons.
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

    // Same feedback pattern as the Math game.
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
// Shapes: shapes with an empty `css` field are drawn as emoji instead of CSS.
/**
 * Shapes mini-game: identify a shape drawn with CSS (or an emoji) from three names.
 * @param {HTMLElement} area - #game-area, rewritten each round.
 * @returns {void}
 */
function startShapesGame(area) {
    // Table columns: name = answer text, symbol = emoji used when css is empty, css = inline
    // style that draws the shape (the triangle uses the zero-size border trick).
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

    // Same feedback pattern as the Math game.
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
// Animals: randomly asks either "who makes this sound" or "what animal is this".
/**
 * Animals mini-game: match an animal to its sound or to its picture.
 * @param {HTMLElement} area - #game-area, rewritten each round.
 * @returns {void}
 */
function startAnimalsGame(area) {
    // Table columns: emoji = picture, name = answer text, sound = what it says in the question.
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

    // Same feedback pattern as the Math game.
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
// Music: eight keys mapped to note frequencies (C4 to C5 in Hz, equal
// temperament). Each tap plays a half-second sine tone with a fast fade-out
// so keys do not click.
/**
 * Music mini-game: eight coloured keys play the C major scale (C4 to C5) as sine tones.
 * @param {HTMLElement} area - #game-area, filled once (the layout never changes).
 * @returns {void}
 */
function startMusicGame(area) {
    // Table columns: note = key label ('C2' is the high C an octave up), color = key colour,
    // freq = frequency in Hz in equal temperament with A4 = 440.
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

    // AudioContext is created lazily on the first tap because browsers only allow
    // audio after a user gesture.
    let audioCtx = null;
    window.playNote = function(freq, btn) {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        // Start at 0.3 volume (quiet enough not to startle) and decay exponentially to
        // near-silence over 0.5s. exponentialRamp cannot target exactly 0, hence 0.001. The
        // fade removes the click an abrupt stop would cause.
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);

        // Brief pressed-key look; reset after 200ms.
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
 * Drawing mini-game: freehand canvas with a nine-colour palette and a Clear button.
 * Works with mouse and touch. The canvas is 350x250 bitmap pixels; CSS may scale it, which
 * getPos compensates for.
 *
 * @param {HTMLElement} area - #game-area, filled once.
 * @returns {void}
 */
function startDrawingGame(area) {
    // Palette; white doubles as an eraser. #000000 is the starting brush.
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

    // Grab the canvas that the template above just created and paint it opaque white (a
    // fresh canvas is transparent and would show the tablet colour through).
    const canvas = document.getElementById('draw-canvas');
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // 4px round-capped strokes look like a marker and join without gaps.
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.strokeStyle = currentColor;

    // True between pointer-down and pointer-up; gates the move handlers.
    let drawing = false;

    /**
     * Converts a pointer position to canvas bitmap coordinates. The canvas may be shown at a
     * different CSS size than its 350x250 bitmap, so the offset inside its bounding box is
     * scaled by bitmap size / displayed size. Handles mouse events and the first touch point.
     * @param {MouseEvent|TouchEvent} e
     * @returns {{x: number, y: number}} canvas pixels.
     */
    function getPos(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: (clientX - rect.left) * (canvas.width / rect.width),
            y: (clientY - rect.top) * (canvas.height / rect.height)
        };
    }

    // Pointer handlers: down starts a new path, move extends it with a line segment, up or
    // leave ends it (mouseleave prevents a stuck stroke if the button is released outside).
    // The touch versions call preventDefault so drawing does not scroll the page.
    canvas.addEventListener('mousedown', (e) => {
        drawing = true;
        const p = getPos(e);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
    });
    canvas.addEventListener('mousemove', (e) => {
        if (!drawing) return;
        const p = getPos(e);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
    });
    canvas.addEventListener('mouseup', () => drawing = false);
    canvas.addEventListener('mouseleave', () => drawing = false);

    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        drawing = true;
        const p = getPos(e);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
    });
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (!drawing) return;
        const p = getPos(e);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
    });
    canvas.addEventListener('touchend', () => drawing = false);

    // Called by the palette dots' inline onclick: changes the brush colour and moves the
    // `active` ring to the clicked dot.
    window.setDrawColor = function(color, dot) {
        currentColor = color;
        ctx.strokeStyle = color;
        document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
    };

    // Clear button: repaint white. strokeStyle is reassigned because assigning fillStyle
    // does not change it, but keeps the brush colour explicit after the reset.
    window.clearCanvas = function() {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = currentColor;
    };
}

// ==================== INIT ====================
// All other behaviour is triggered by inline onclick handlers in index.html.
// setupDragAndDrop looks up elements by class/id, so it must wait until the DOM exists.
// index.html loads this script at the end of <body>, so the elements are already parsed;
// the event is kept as a safeguard if the tag is ever moved into <head>.
document.addEventListener('DOMContentLoaded', () => {
    setupDragAndDrop();
});
