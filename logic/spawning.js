/**
 * Unified Spawn Function - Works for any unit class
 * @param {Function} UnitClass - The unit class to spawn
 * @param {boolean} [isEnemy=false] - Whether to spawn as enemy
 * @returns {BaseUnit|null} - The spawned unit or null if spawn failed
 */
function spawnUnit(UnitClass, isEnemy = false) {
    const currentTime = Date.now();
    const className = UnitClass.name;
    const spawnType = isEnemy ? 'enemy' : 'player';
    
    const lastSpawnTime = gameState.lastSpawnTimes[spawnType][className] || 0;
    const timeSinceLastSpawn = currentTime - lastSpawnTime;
    
    if (timeSinceLastSpawn < UnitClass.SPAWN_COOLDOWN) {
        return false;
    }
    
    if (!isEnemy && gameState.money < UnitClass.COST) {
        return false;
    }
    
    const base = isEnemy ? gameState.enemyBase : gameState.playerBase;
    const baseCenterX = base.x + base.width / 2;
    const spawnX = baseCenterX - UnitClass.SIZE / 2;
    const spawnY = CONFIG.GROUND_Y - UnitClass.SIZE;
    
    const unit = new UnitClass(spawnX, spawnY, isEnemy);
    if (isEnemy) {
        gameState.enemyUnits.push(unit);
    } else {
        gameState.units.push(unit);
        gameState.money -= UnitClass.COST;
    }
    
    gameState.lastSpawnTimes[spawnType][className] = currentTime;
    
    if (!isEnemy) {
        updateUI();
    }
    
    return unit;
}

/**
 * Spawn melee unit
 * @returns {MeleeUnit|null} - The spawned unit or null
 */
function spawnMeleeUnit() {
    return spawnUnit(MeleeUnit, false);
}

/**
 * Spawn ranged unit
 * @returns {RangedUnit|null} - The spawned unit or null
 */
function spawnRangedUnit() {
    return spawnUnit(RangedUnit, false);
}

/**
 * Spawn bomber unit
 * @returns {SuicideBomberUnit|null} - The spawned unit or null
 */
function spawnBomberUnit() {
    return spawnUnit(SuicideBomberUnit, false);
}

/**
 * Spawn tank unit
 * @returns {TankUnit|null} - The spawned unit or null
 */
function spawnTankUnit() {
    return spawnUnit(TankUnit, false);
}

/**
 * Spawn Enemy Unit (random type with balanced probabilities)
 * @returns {BaseUnit|null} - The spawned enemy unit or null
 */
function spawnEnemyUnit() {
    const random = Math.random();
    let UnitClass;
    
    if (random < 0.40) {
        UnitClass = MeleeUnit;
    } else if (random < 0.65) {
        UnitClass = RangedUnit;
    } else if (random < 0.80) {
        UnitClass = SuicideBomberUnit;
    } else if (random < 0.90) {
        UnitClass = TankUnit;
    } else if (random < 0.95) {
        UnitClass = SniperUnit;
    } else {
        UnitClass = PoisonUnit;
    }
    
    if (!UnitClass) {
        console.error('UnitClass is undefined in spawnEnemyUnit');
        return null;
    }
    
    const unit = spawnUnit(UnitClass, true);
    
    if (unit && gameState.currentLevel > 0) {
        const levelMultiplier = 0.5 + (gameState.currentLevel - 1) * 0.5;
        
        unit.health = Math.floor(unit.health * levelMultiplier);
        unit.maxHealth = Math.floor(unit.maxHealth * levelMultiplier);
        
        if (unit instanceof MeleeUnit) {
            unit.levelDamage = Math.floor(MeleeUnit.ATTACK_DAMAGE * levelMultiplier);
        } else if (unit instanceof RangedUnit) {
            unit.levelDamage = Math.floor(RangedUnit.ATTACK_DAMAGE * levelMultiplier);
        } else if (unit instanceof TankUnit) {
            unit.levelDamage = Math.floor(TankUnit.ATTACK_DAMAGE * levelMultiplier);
        } else if (unit instanceof SniperUnit) {
            unit.levelDamage = Math.floor(SniperUnit.ATTACK_DAMAGE * levelMultiplier);
        } else if (unit instanceof PoisonUnit) {
            unit.levelDamage = Math.floor(PoisonUnit.ATTACK_DAMAGE * levelMultiplier);
            unit.levelPoisonDamage = Math.floor(PoisonUnit.POISON_DAMAGE * levelMultiplier);
        } else if (unit instanceof SuicideBomberUnit) {
            unit.levelExplosionDamage = Math.floor(SuicideBomberUnit.EXPLOSION_DAMAGE * levelMultiplier);
        }
    }
    
    return unit;
}
