/**
 * Main Game Entry Point
 * This file initializes the game and sets up event listeners
 */

var gameStarted = false;
var selectedSlotIndex = null;

const UNIT_TYPES = {
    'MeleeUnit': MeleeUnit,
    'RangedUnit': RangedUnit,
    'SuicideBomberUnit': SuicideBomberUnit,
    'TankUnit': TankUnit,
    'SniperUnit': SniperUnit,
    'PoisonUnit': PoisonUnit
};

const UNIT_NAMES = {
    'MeleeUnit': 'Melee',
    'RangedUnit': 'Ranged',
    'SuicideBomberUnit': 'Bomber',
    'TankUnit': 'Tank',
    'SniperUnit': 'Sniper',
    'PoisonUnit': 'Poison'
};

/**
 * Show slot configuration screen
 */
function showSlotConfig() {
    const menuScreen = document.getElementById('menu-screen');
    const slotConfigScreen = document.getElementById('slot-config-screen');
    menuScreen.classList.add('hidden');
    slotConfigScreen.classList.add('show');
    renderSlotConfig();
}

/**
 * Hide slot configuration screen
 */
function hideSlotConfig() {
    const menuScreen = document.getElementById('menu-screen');
    const slotConfigScreen = document.getElementById('slot-config-screen');
    slotConfigScreen.classList.remove('show');
    menuScreen.classList.remove('hidden');
    selectedSlotIndex = null;
}

/**
 * Render slot configuration UI
 */
function renderSlotConfig() {
    const container = document.getElementById('slot-config-container');
    container.innerHTML = '';
    
    for (let i = 0; i < 9; i++) {
        const slotItem = document.createElement('div');
        slotItem.className = 'slot-config-item';
        if (selectedSlotIndex === i) {
            slotItem.classList.add('selected');
        }
        
        const slotNumber = document.createElement('div');
        slotNumber.className = 'slot-number';
        slotNumber.textContent = `Slot ${i + 1}`;
        
        const slotUnit = document.createElement('div');
        if (gameState.unitSlots[i]) {
            slotUnit.className = 'slot-unit';
            slotUnit.textContent = UNIT_NAMES[gameState.unitSlots[i]];
        } else {
            slotUnit.className = 'slot-empty';
            slotUnit.textContent = 'Empty';
        }
        
        slotItem.appendChild(slotNumber);
        slotItem.appendChild(slotUnit);
        
        slotItem.addEventListener('click', () => {
            if (selectedSlotIndex === i) {
                gameState.unitSlots[i] = null;
                selectedSlotIndex = null;
            } else if (selectedSlotIndex !== null) {
                if (gameState.unitSlots[i]) {
                    const temp = gameState.unitSlots[selectedSlotIndex];
                    gameState.unitSlots[selectedSlotIndex] = gameState.unitSlots[i];
                    gameState.unitSlots[i] = temp;
                } else {
                    gameState.unitSlots[i] = gameState.unitSlots[selectedSlotIndex];
                    gameState.unitSlots[selectedSlotIndex] = null;
                }
                selectedSlotIndex = null;
            } else {
                selectedSlotIndex = i;
            }
            renderSlotConfig();
        });
        
        container.appendChild(slotItem);
    }
    
    const unitOptions = document.querySelectorAll('.unit-option');
    unitOptions.forEach(option => {
        const unitType = option.getAttribute('data-unit');
        option.classList.remove('selected', 'unavailable');
        
        let isAlreadyAssigned = false;
        for (let i = 0; i < gameState.unitSlots.length; i++) {
            if (i !== selectedSlotIndex && gameState.unitSlots[i] === unitType) {
                isAlreadyAssigned = true;
                break;
            }
        }
        
        if (isAlreadyAssigned) {
            option.classList.add('unavailable');
            option.style.opacity = '0.5';
            option.style.cursor = 'not-allowed';
        } else {
            option.style.opacity = '1';
            option.style.cursor = 'pointer';
        }
        
        if (selectedSlotIndex !== null && gameState.unitSlots[selectedSlotIndex] === unitType) {
            option.classList.add('selected');
        }
    });
}

/**
 * Assign unit to selected slot
 * @param {string} unitType - Type of unit to assign
 */
function assignUnitToSlot(unitType) {
    if (selectedSlotIndex === null) return;
    
    for (let i = 0; i < gameState.unitSlots.length; i++) {
        if (i !== selectedSlotIndex && gameState.unitSlots[i] === unitType) {
            return;
        }
    }
    
    gameState.unitSlots[selectedSlotIndex] = unitType;
    selectedSlotIndex = null;
    renderSlotConfig();
}

/**
 * Show level selection screen
 */
function showLevelSelect() {
    const menuScreen = document.getElementById('menu-screen');
    const levelSelectScreen = document.getElementById('level-select-screen');
    menuScreen.classList.add('hidden');
    levelSelectScreen.classList.add('show');
    renderLevelSelect();
}

/**
 * Hide level selection screen
 */
function hideLevelSelect() {
    const menuScreen = document.getElementById('menu-screen');
    const levelSelectScreen = document.getElementById('level-select-screen');
    levelSelectScreen.classList.remove('show');
    menuScreen.classList.remove('hidden');
}

/**
 * Render level selection screen
 */
function renderLevelSelect() {
    const container = document.getElementById('level-card-container');
    container.innerHTML = '';
    
    const maxLevel = 10;
    const selectedLevel = gameState.selectedLevel;
    
    const levelCard = document.createElement('div');
    levelCard.className = 'level-card';
    if (gameState.unlockedLevels.includes(selectedLevel)) {
        levelCard.classList.add('selected');
    } else {
        levelCard.classList.add('locked');
    }
    
    const levelNumber = document.createElement('div');
    levelNumber.className = 'level-number';
    levelNumber.textContent = selectedLevel;
    
    const levelLabel = document.createElement('div');
    levelLabel.className = 'level-label';
    levelLabel.textContent = 'Level';
    
    if (!gameState.unlockedLevels.includes(selectedLevel)) {
        const lockIcon = document.createElement('div');
        lockIcon.className = 'lock-icon';
        lockIcon.textContent = '🔒';
        levelCard.appendChild(lockIcon);
    }
    
    levelCard.appendChild(levelNumber);
    levelCard.appendChild(levelLabel);
    
    levelCard.addEventListener('click', () => {
        if (gameState.unlockedLevels.includes(selectedLevel)) {
            startLevel(selectedLevel);
        }
    });
    
    container.appendChild(levelCard);
    
    const leftArrow = document.getElementById('level-nav-left');
    const rightArrow = document.getElementById('level-nav-right');
    leftArrow.disabled = selectedLevel <= 1;
    rightArrow.disabled = selectedLevel >= maxLevel;
    
    const startButton = document.getElementById('start-level-button');
    startButton.disabled = !gameState.unlockedLevels.includes(selectedLevel);
}

/**
 * Navigate levels
 * @param {string} direction - 'left' or 'right'
 */
function navigateLevel(direction) {
    const maxLevel = 10;
    if (direction === 'left' && gameState.selectedLevel > 1) {
        gameState.selectedLevel--;
    } else if (direction === 'right' && gameState.selectedLevel < maxLevel) {
        gameState.selectedLevel++;
    }
    renderLevelSelect();
}

/**
 * Start a specific level
 * @param {number} levelNumber - Level number to start
 * @param {boolean} [preserveSlots=false] - Whether to preserve unit slots
 */
function startLevel(levelNumber, preserveSlots = false) {
    if (!gameState.unlockedLevels.includes(levelNumber)) {
        return;
    }
    
    gameState.currentLevel = levelNumber;
    gameState.moneyGenerationLevel = 0;
    gameState.accumulatedMoney = 0;
    
    if (!preserveSlots && gameState.unitSlots.every(slot => slot === null)) {
        gameState.unitSlots[0] = 'MeleeUnit';
        gameState.unitSlots[1] = 'RangedUnit';
        gameState.unitSlots[2] = 'TankUnit';
        gameState.unitSlots[3] = 'PoisonUnit';
        gameState.unitSlots[4] = 'SniperUnit';
    }
    
    startGame();
}

/**
 * Start the game
 */
function startGame() {
    gameState.money = CONFIG.STARTING_MONEY;
    gameState.units = [];
    gameState.enemyUnits = [];
    gameState.playerBase = {
        x: 50,
        y: CONFIG.GROUND_Y - CONFIG.BASE_HEIGHT,
        width: CONFIG.BASE_WIDTH,
        height: CONFIG.BASE_HEIGHT,
        health: 500,
        maxHealth: 500,
        lastAttack: 0,
        attackingUnits: []
    };
    gameState.enemyBase = {
        x: CONFIG.CANVAS_WIDTH - 50 - CONFIG.BASE_WIDTH,
        y: CONFIG.GROUND_Y - CONFIG.BASE_HEIGHT,
        width: CONFIG.BASE_WIDTH,
        height: CONFIG.BASE_HEIGHT,
        health: 500,
        maxHealth: 500,
        lastAttack: 0,
        attackingUnits: []
    };
    gameState.lastMoneyTick = Date.now();
    gameState.lastEnemySpawn = Date.now();
    gameState.nextEnemySpawnInterval = 0;
    gameState.lastSpawnTimes = {
        player: {},
        enemy: {}
    };
    gameState.gameOver = false;
    gameState.paused = false;
    gameState.projectiles = [];
    gameState.explosions = [];
    
    if (gameStarted) {
        const controls = document.getElementById('controls');
        if (controls) {
            controls.classList.add('show');
        }
        
        const pauseButton = document.getElementById('pause-button');
        if (pauseButton) {
            pauseButton.classList.add('show');
            pauseButton.textContent = 'Pause';
        }
        
        renderUpgradeButton();
        updateUI();
        renderSlotControls();
        
        if (gameState.gameLoopId) {
            cancelAnimationFrame(gameState.gameLoopId);
        }
        gameLoop();
        return;
    }
    
    gameStarted = true;
    const menuScreen = document.getElementById('menu-screen');
    menuScreen.classList.add('hidden');
    
    const levelSelectScreen = document.getElementById('level-select-screen');
    levelSelectScreen.classList.remove('show');
    const slotConfigScreen = document.getElementById('slot-config-screen');
    slotConfigScreen.classList.remove('show');
    
    const controls = document.getElementById('controls');
    if (controls) {
        controls.classList.add('show');
    }
    
    const backgroundMusic = document.getElementById('background-music');
    if (backgroundMusic) {
        backgroundMusic.volume = 0.5;
        backgroundMusic.play().catch(error => {
            console.log('Could not play music:', error);
        });
    }
    
    renderUpgradeButton();
    
    const pauseButton = document.getElementById('pause-button');
    pauseButton.classList.add('show');
    pauseButton.textContent = 'Pause';
    
    const pauseScreen = document.getElementById('pause-screen');
    pauseScreen.classList.remove('show');
    
    updateUI();
    renderSlotControls();
    gameLoop();
}

/**
 * Render slot controls
 */
function renderSlotControls() {
    const controls = document.getElementById('controls');
    if (!controls) return;
    
    controls.innerHTML = '';
    
    for (let i = 0; i < 9; i++) {
        const slot = gameState.unitSlots[i];
        if (!slot) continue;
        
        const button = document.createElement('button');
        button.className = 'slot-button';
        button.setAttribute('data-slot-index', i);
        button.setAttribute('data-unit-type', slot);
        
        const UnitClass = UNIT_TYPES[slot];
        button.textContent = `${i + 1}: ${UNIT_NAMES[slot]} (Cost: ${UnitClass.COST})`;
        
        button.addEventListener('click', () => {
            spawnUnitFromSlot(i);
        });
        
        controls.appendChild(button);
    }
    
    updateUI();
}

/**
 * Create/update upgrade button in game area
 */
function renderUpgradeButton() {
    let upgradeButton = document.getElementById('upgrade-money');
    
    if (!upgradeButton) {
        const gameArea = document.getElementById('game-area');
        upgradeButton = document.createElement('button');
        upgradeButton.id = 'upgrade-money';
        upgradeButton.addEventListener('click', upgradeMoneyGeneration);
        gameArea.appendChild(upgradeButton);
    }
}

/**
 * Spawn unit from slot
 * @param {number} slotIndex - Index of the slot to spawn from
 */
function spawnUnitFromSlot(slotIndex) {
    if (gameState.paused) return;
    
    const unitType = gameState.unitSlots[slotIndex];
    if (!unitType) return;
    
    const UnitClass = UNIT_TYPES[unitType];
    if (!UnitClass) return;
    
    spawnUnit(UnitClass, false);
}

/**
 * Toggle pause
 */
function togglePause() {
    if (!gameStarted || gameState.gameOver) return;
    
    gameState.paused = !gameState.paused;
    const pauseScreen = document.getElementById('pause-screen');
    const pauseButton = document.getElementById('pause-button');
    
    if (gameState.paused) {
        pauseScreen.classList.add('show');
        pauseButton.textContent = 'Resume';
    } else {
        pauseScreen.classList.remove('show');
        pauseButton.textContent = 'Pause';
    }
}

document.getElementById('configure-slots-button').addEventListener('click', showSlotConfig);
document.getElementById('back-to-menu-button').addEventListener('click', hideSlotConfig);
document.getElementById('start-button').addEventListener('click', showLevelSelect);
document.getElementById('back-from-level-select-button').addEventListener('click', hideLevelSelect);
document.getElementById('start-level-button').addEventListener('click', () => {
    startLevel(gameState.selectedLevel);
});
document.getElementById('level-nav-left').addEventListener('click', () => navigateLevel('left'));
document.getElementById('level-nav-right').addEventListener('click', () => navigateLevel('right'));
document.getElementById('pause-button').addEventListener('click', togglePause);
document.getElementById('resume-button').addEventListener('click', togglePause);
document.getElementById('pause-return-to-menu-button').addEventListener('click', returnToMenuFromPause);
document.getElementById('restart-button').addEventListener('click', function() {
    const action = this.getAttribute('data-action');
    if (action === 'next-level') {
        proceedToNextLevel();
        } else {
        restartGame();
    }
});

/**
 * Return to menu
 */
function returnToMenu() {
    gameState.gameOver = false;
    gameState.paused = false;
    gameStarted = false;
    
    const restartScreen = document.getElementById('restart-screen');
    restartScreen.classList.remove('show');
    
    const controls = document.getElementById('controls');
    if (controls) {
        controls.classList.remove('show');
    }
    const pauseButton = document.getElementById('pause-button');
    if (pauseButton) {
        pauseButton.classList.remove('show');
    }
    
    if (gameState.gameLoopId) {
        cancelAnimationFrame(gameState.gameLoopId);
        gameState.gameLoopId = null;
    }
    
    const menuScreen = document.getElementById('menu-screen');
    menuScreen.classList.remove('hidden');
    
    const backgroundMusic = document.getElementById('background-music');
    if (backgroundMusic) {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
    }
}

document.getElementById('return-to-menu-button').addEventListener('click', returnToMenu);

/**
 * Return to menu from pause screen
 */
function returnToMenuFromPause() {
    gameState.paused = false;
    const pauseScreen = document.getElementById('pause-screen');
    pauseScreen.classList.remove('show');
    const pauseButton = document.getElementById('pause-button');
    if (pauseButton) {
        pauseButton.textContent = 'Pause';
    }
    
    returnToMenu();
}

(function setupUnitSelectionListeners() {
    const unitOptions = document.querySelectorAll('.unit-option');
    unitOptions.forEach(option => {
        option.addEventListener('click', () => {
            if (option.classList.contains('unavailable')) {
                return;
            }
            const unitType = option.getAttribute('data-unit');
            assignUnitToSlot(unitType);
        });
    });
})();

document.addEventListener('keydown', function(event) {
    const levelSelectScreen = document.getElementById('level-select-screen');
    if (levelSelectScreen.classList.contains('show')) {
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            navigateLevel('left');
            return;
        } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            navigateLevel('right');
            return;
        } else if (event.key === 'Enter') {
            event.preventDefault();
            if (gameState.unlockedLevels.includes(gameState.selectedLevel)) {
                startLevel(gameState.selectedLevel);
            }
            return;
        }
    }
    
    if (!gameStarted) return;
    
    const menuScreen = document.getElementById('menu-screen');
    if (!menuScreen.classList.contains('hidden')) return;
    
    if (event.key === ' ' || event.key === 'p' || event.key === 'P') {
        event.preventDefault();
        togglePause();
        return;
    }
    
    if (gameState.paused) return;
    
    const key = event.key;
    if (key >= '1' && key <= '9') {
        const slotIndex = parseInt(key) - 1;
        spawnUnitFromSlot(slotIndex);
    }
});
