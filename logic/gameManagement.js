/**
 * Show restart screen
 * @param {boolean} won - Whether the player won
 */
function showRestartScreen(won) {
    if (gameState.gameOver) {
        return;
    }
    
    gameState.gameOver = true;
    
    const controls = document.getElementById('controls');
    if (controls) {
        controls.classList.remove('show');
    }
    
    const pauseButton = document.getElementById('pause-button');
    if (pauseButton) {
        pauseButton.classList.remove('show');
    }
    
    gameState.paused = false;
    const pauseScreen = document.getElementById('pause-screen');
    if (pauseScreen) {
        pauseScreen.classList.remove('show');
    }
    
    const restartScreen = document.getElementById('restart-screen');
    const resultMessage = document.getElementById('result-message');
    const restartButton = document.getElementById('restart-button');
    const returnToMenuButton = document.getElementById('return-to-menu-button');
    
    if (won) {
        const nextLevel = gameState.currentLevel + 1;
        if (!gameState.unlockedLevels.includes(nextLevel)) {
            gameState.unlockedLevels.push(nextLevel);
        }
        
        resultMessage.textContent = `Level ${gameState.currentLevel} Complete!`;
        resultMessage.className = 'result-message win';
        restartButton.textContent = 'Next Level';
        restartButton.setAttribute('data-action', 'next-level');
        if (returnToMenuButton) {
            returnToMenuButton.style.display = 'block';
        }
    } else {
        resultMessage.textContent = 'Game Over! You Lost!';
        resultMessage.className = 'result-message lose';
        restartButton.textContent = 'Restart';
        restartButton.setAttribute('data-action', 'restart');
        if (returnToMenuButton) {
            returnToMenuButton.style.display = 'none';
        }
    }
    
    restartScreen.classList.add('show');
}

/**
 * Proceed to next level
 */
function proceedToNextLevel() {
    const nextLevel = gameState.currentLevel + 1;
    
    hideRestartScreen();
    
    startLevel(nextLevel, true);
}

/**
 * Hide restart screen
 */
function hideRestartScreen() {
    const restartScreen = document.getElementById('restart-screen');
    restartScreen.classList.remove('show');
}

/**
 * Restart game
 */
function restartGame() {
    const backgroundMusic = document.getElementById('background-music');
    if (backgroundMusic) {
        backgroundMusic.currentTime = 0;
        backgroundMusic.play().catch(error => {
            console.log('Could not play music:', error);
        });
    }
    
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
    gameState.moneyGenerationLevel = 0;
    gameState.accumulatedMoney = 0;
    gameState.gameOver = false;
    gameState.paused = false;
    gameState.projectiles = [];
    gameState.explosions = [];
    gameStarted = false;
    
    hideRestartScreen();
    
    const menuScreen = document.getElementById('menu-screen');
    const controls = document.getElementById('controls');
    if (controls) {
        controls.classList.remove('show');
    }
    menuScreen.classList.remove('hidden');
}
