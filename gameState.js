/**
 * Game State
 */
const gameState = {
    money: CONFIG.STARTING_MONEY,
    units: [],
    enemyUnits: [],
    playerBase: { x: 50, y: CONFIG.GROUND_Y - CONFIG.BASE_HEIGHT, width: CONFIG.BASE_WIDTH, height: CONFIG.BASE_HEIGHT, health: 2000, maxHealth: 2000, lastAttack: 0, attackingUnits: [] },
    enemyBase: { x: CONFIG.CANVAS_WIDTH - 50 - CONFIG.BASE_WIDTH, y: CONFIG.GROUND_Y - CONFIG.BASE_HEIGHT, width: CONFIG.BASE_WIDTH, height: CONFIG.BASE_HEIGHT, health: 200, maxHealth: 2000, lastAttack: 0, attackingUnits: [] },
    lastMoneyTick: Date.now(),
    lastEnemySpawn: Date.now(),
    nextEnemySpawnInterval: 0,
    lastSpawnTimes: {
        player: {},
        enemy: {}
    },
    gameOver: false,
    gameLoopId: null,
    projectiles: [],
    explosions: [],
    moneyGenerationLevel: 0,
    accumulatedMoney: 0,
    currentLevel: 1,
    selectedLevel: 1,
    unlockedLevels: [1],
    unitSlots: [null, null, null, null, null, null, null, null, null],
    paused: false,
};

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
canvas.width = CONFIG.CANVAS_WIDTH;
canvas.height = CONFIG.CANVAS_HEIGHT;
