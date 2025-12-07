/**
 * Money Generation Upgrade System
 */
const MAX_MONEY_GENERATION_LEVEL = 5;
const BASE_UPGRADE_COST = 40;

/**
 * Get upgrade cost for current level
 * @param {number} level - Current upgrade level
 * @returns {number} - Cost for next upgrade
 */
function getUpgradeCost(level) {
    return BASE_UPGRADE_COST * Math.pow(2, level);
}

/**
 * Upgrade money generation
 * @returns {boolean} - True if upgrade was successful
 */
function upgradeMoneyGeneration() {
    if (gameState.paused) {
        return false;
    }
    
    if (gameState.moneyGenerationLevel >= MAX_MONEY_GENERATION_LEVEL) {
        return false;
    }
    
    const cost = getUpgradeCost(gameState.moneyGenerationLevel);
    
    if (gameState.money < cost) {
        return false;
    }
    
    gameState.money -= cost;
    gameState.moneyGenerationLevel++;
    
    updateUI();
    
    return true;
}
