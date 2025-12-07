/**
 * Update UI
 */
function updateUI() {
    document.getElementById('money').textContent = Math.floor(gameState.money);
    document.getElementById('level').textContent = gameState.currentLevel;
    
    const upgradeButton = document.getElementById('upgrade-money');
    if (upgradeButton) {
        if (gameState.moneyGenerationLevel >= MAX_MONEY_GENERATION_LEVEL) {
            upgradeButton.disabled = true;
            upgradeButton.textContent = `Money Gen: MAX (Level ${gameState.moneyGenerationLevel})`;
        } else {
            const cost = getUpgradeCost(gameState.moneyGenerationLevel);
            const hasEnoughMoney = gameState.money >= cost;
            upgradeButton.disabled = !hasEnoughMoney;
            upgradeButton.textContent = `Upgrade Money +1 (Cost: ${cost}) [Lv ${gameState.moneyGenerationLevel + 1}/${MAX_MONEY_GENERATION_LEVEL}]`;
        }
    }
    
    const currentTime = Date.now();
    const slotButtons = document.querySelectorAll('.slot-button');
    
    if (typeof UNIT_TYPES === 'undefined' || typeof UNIT_NAMES === 'undefined') {
        return;
    }
    
    slotButtons.forEach(button => {
        const slotIndex = parseInt(button.getAttribute('data-slot-index'));
        const unitType = button.getAttribute('data-unit-type');
        
        if (!unitType) return;
        
        const UnitClass = UNIT_TYPES[unitType];
        if (!UnitClass) return;
        
        const className = UnitClass.name;
        const lastSpawnTime = gameState.lastSpawnTimes.player[className] || 0;
        const timeSinceLastSpawn = currentTime - lastSpawnTime;
        const cooldownRemaining = UnitClass.SPAWN_COOLDOWN - timeSinceLastSpawn;
        const hasCooldown = cooldownRemaining > 0;
        const hasEnoughMoney = gameState.money >= UnitClass.COST;
        
        button.disabled = !hasEnoughMoney || hasCooldown;
        if (hasCooldown) {
            const secondsRemaining = (cooldownRemaining / 1000).toFixed(1);
            button.textContent = `${slotIndex + 1}: ${UNIT_NAMES[unitType]} (Cooldown: ${secondsRemaining}s)`;
        } else {
            button.textContent = `${slotIndex + 1}: ${UNIT_NAMES[unitType]} (Cost: ${UnitClass.COST})`;
        }
    });
}
