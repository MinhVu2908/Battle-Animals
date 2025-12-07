/**
 * Process poison damage for units
 * @param {Array<BaseUnit>} units - Array of units to process
 */
function processPoisonDamage(units) {
    const now = Date.now();
    
    for (const unit of units) {
        if (!unit.isAlive() || !unit.poison) continue;
        
        const poison = unit.poison;
        const timeSinceStart = now - poison.startTime;
        
        if (timeSinceStart >= poison.duration) {
            delete unit.poison;
            continue;
        }
        
        const timeSinceLastTick = now - poison.lastTickTime;
        if (timeSinceLastTick >= poison.tickInterval) {
            unit.takeDamage(poison.damagePerTick);
            poison.lastTickTime = now;
        }
    }
}

/**
 * Main game loop
 */
function gameLoop() {
    if (gameState.gameOver) {
        return;
    }
    
    if (gameState.paused) {
        gameState.gameLoopId = requestAnimationFrame(gameLoop);
        return;
    }
    
    const currentTime = Date.now();
    const timeSinceLastTick = currentTime - gameState.lastMoneyTick;
    
    if (timeSinceLastTick >= 200) {
        const moneyPerSecond = CONFIG.MONEY_PER_SECOND + gameState.moneyGenerationLevel;
        const moneyPerTick = moneyPerSecond ;
        
        gameState.accumulatedMoney += moneyPerTick;
        
        const wholeMoney = Math.floor(gameState.accumulatedMoney);
        if (wholeMoney > 0) {
            gameState.money += wholeMoney;
            gameState.accumulatedMoney -= wholeMoney;
        }
        
        gameState.lastMoneyTick = currentTime;
    }
    
    const timeSinceLastEnemySpawn = currentTime - gameState.lastEnemySpawn;
    
    if (gameState.nextEnemySpawnInterval === 0) {
        gameState.nextEnemySpawnInterval = CONFIG.ENEMY_SPAWN_INTERVAL_MIN + 
            Math.random() * (CONFIG.ENEMY_SPAWN_INTERVAL_MAX - CONFIG.ENEMY_SPAWN_INTERVAL_MIN);
    }
    
    if (timeSinceLastEnemySpawn >= gameState.nextEnemySpawnInterval) {
        spawnEnemyUnit();
        gameState.lastEnemySpawn = currentTime;
        gameState.nextEnemySpawnInterval = CONFIG.ENEMY_SPAWN_INTERVAL_MIN + 
            Math.random() * (CONFIG.ENEMY_SPAWN_INTERVAL_MAX - CONFIG.ENEMY_SPAWN_INTERVAL_MIN);
    }
    
    updateUI();
    
    ctx.clearRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
    
    drawGround();
    
    drawBase(gameState.playerBase, true);
    drawBase(gameState.enemyBase, false);
    
    gameState.units = gameState.units.filter(unit => {
        unit.update();
        if (unit.isAlive()) {
            unit.draw();
            return true;
        } else {
            const playerIndex = gameState.playerBase.attackingUnits.indexOf(unit);
            if (playerIndex > -1) gameState.playerBase.attackingUnits.splice(playerIndex, 1);
            const enemyIndex = gameState.enemyBase.attackingUnits.indexOf(unit);
            if (enemyIndex > -1) gameState.enemyBase.attackingUnits.splice(enemyIndex, 1);
            return false;
        }
    });
    
    let rewardGiven = false;
    gameState.enemyUnits = gameState.enemyUnits.filter(unit => {
        unit.update();
        
        if (unit.isAlive()) {
            unit.draw();
            return true;
        } else {
            const unitCost = unit.unitCost || (unit.constructor.COST) || 0;
            if (unitCost > 0) {
                const reward = Math.floor(unitCost * CONFIG.KILL_REWARD_PERCENTAGE);
                if (reward > 0) {
                    gameState.money += reward;
                    rewardGiven = true;
                }
            }
            
            const playerIndex = gameState.playerBase.attackingUnits.indexOf(unit);
            if (playerIndex > -1) gameState.playerBase.attackingUnits.splice(playerIndex, 1);
            const enemyIndex = gameState.enemyBase.attackingUnits.indexOf(unit);
            if (enemyIndex > -1) gameState.enemyBase.attackingUnits.splice(enemyIndex, 1);
            return false;
        }
    });
    
    if (rewardGiven) {
        updateUI();
    }
    
    processPoisonDamage(gameState.units);
    processPoisonDamage(gameState.enemyUnits);
    
    gameState.projectiles = gameState.projectiles.filter(projectile => {
        if (!projectile.update()) {
            return false;
        }
        
        let hit = false;
        
        if (projectile.isEnemy) {
            for (const unit of gameState.units) {
                if (unit.isAlive() && projectile.checkHit(unit)) {
                    unit.takeDamage(projectile.damage);
                    hit = true;
                    break;
                }
            }
            if (!hit && projectile.checkHit(gameState.playerBase)) {
                gameState.playerBase.health -= projectile.damage;
                if (gameState.playerBase.health < 0) gameState.playerBase.health = 0;
                hit = true;
            }
        } else {
            for (const unit of gameState.enemyUnits) {
                if (unit.isAlive() && projectile.checkHit(unit)) {
                    unit.takeDamage(projectile.damage);
                    hit = true;
                    break;
                }
            }
            if (!hit && projectile.checkHit(gameState.enemyBase)) {
                gameState.enemyBase.health -= projectile.damage;
                if (gameState.enemyBase.health < 0) gameState.enemyBase.health = 0;
                hit = true;
            }
        }
        
        if (hit) {
            return false;
        }
        
        projectile.draw();
        return true;
    });
    
    gameState.explosions = gameState.explosions.filter(explosion => {
        const isActive = explosion.update();
        if (isActive) {
            explosion.draw();
        }
        return isActive;
    });
    
    gameState.units.forEach(unit => {
        if (unit.isAlive() && unit.target && !unit.isRanged) {
            if (unit.drawAttackLine) unit.drawAttackLine();
        }
    });
    gameState.enemyUnits.forEach(unit => {
        if (unit.isAlive() && unit.target && !unit.isRanged) {
            if (unit.drawAttackLine) unit.drawAttackLine();
        }
    });
    
    updateBaseAttacks();
    
    if (gameState.playerBase.health <= 0) {
        showRestartScreen(false);
        return;
    }
    
    if (gameState.enemyBase.health <= 0) {
        showRestartScreen(true);
        return;
    }
    
    gameState.gameLoopId = requestAnimationFrame(gameLoop);
}
