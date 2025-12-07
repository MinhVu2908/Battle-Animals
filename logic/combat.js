/**
 * Handle base counter-attacks
 */
function updateBaseAttacks() {
    const currentTime = Date.now();
    
    if (gameState.playerBase.health > 0 && gameState.playerBase.attackingUnits.length > 0) {
        if (currentTime - gameState.playerBase.lastAttack >= CONFIG.BASE_ATTACK_COOLDOWN) {
            gameState.playerBase.attackingUnits.forEach(unit => {
                if (unit && unit.isAlive()) {
                    unit.takeDamage(CONFIG.BASE_ATTACK_DAMAGE);
                }
            });
            gameState.playerBase.attackingUnits = gameState.playerBase.attackingUnits.filter(u => u && u.isAlive());
            gameState.playerBase.lastAttack = currentTime;
        }
    }
    
    if (gameState.enemyBase.health > 0 && gameState.enemyBase.attackingUnits.length > 0) {
        if (currentTime - gameState.enemyBase.lastAttack >= CONFIG.BASE_ATTACK_COOLDOWN) {
            gameState.enemyBase.attackingUnits.forEach(unit => {
                if (unit && unit.isAlive()) {
                    unit.takeDamage(CONFIG.BASE_ATTACK_DAMAGE);
                }
            });
            gameState.enemyBase.attackingUnits = gameState.enemyBase.attackingUnits.filter(u => u && u.isAlive());
            gameState.enemyBase.lastAttack = currentTime;
        }
    }
}
