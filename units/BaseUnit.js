/**
 * Base Unit Class - Superclass for all units
 */
class BaseUnit {
    /**
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {boolean} [isEnemy=false] - Whether this is an enemy unit
     */
    constructor(x, y, isEnemy = false) {
        this.x = x;
        this.y = y;
        this.isEnemy = isEnemy;
        this.direction = isEnemy ? -1 : 1;
        this.target = null;
        this.lastAttack = 0;
        this.isStopped = false;
        
        this.size = this.constructor.SIZE;
        this.speed = this.constructor.SPEED;
        this.health = this.constructor.HEALTH;
        this.maxHealth = this.constructor.HEALTH;
        this.unitCost = this.constructor.COST;
    }

    /**
     * Check if this unit is colliding with another unit
     * @param {BaseUnit} other - The other unit to check collision with
     * @returns {boolean} - True if units are colliding
     */
    checkCollision(other) {
        return this.x < other.x + other.size &&
               this.x + this.size > other.x &&
               Math.abs(this.y - other.y) < this.size;
    }

    /**
     * Apply damage to this unit
     * @param {number} amount - Amount of damage to apply
     */
    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.health = 0;
        }
    }

    /**
     * Check if this unit is alive
     * @returns {boolean} - True if unit has health > 0
     */
    isAlive() {
        return this.health > 0;
    }

    /**
     * Check if any enemy unit is targeting this unit
     * @returns {boolean} - True if being attacked
     */
    isBeingAttacked() {
        const enemyUnits = this.isEnemy ? gameState.units : gameState.enemyUnits;
        for (const enemy of enemyUnits) {
            if (enemy.target === this && enemy.isAlive()) {
                return true;
            }
        }
        return false;
    }

    /**
     * Common update logic - can be overridden by subclasses
     */
    update() {
        this.y = CONFIG.GROUND_Y - this.size;
        
        if (this.x > CONFIG.CANVAS_WIDTH || this.x < -this.size) {
            this.health = 0;
        }
    }

    /**
     * Draw health bar showing current/max health as text
     */
    drawHealthBar() {
        const textX = this.x + this.size / 2;
        const textY = this.y - 5;
        
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        
        const healthText = `${Math.ceil(this.health)}/${this.maxHealth}`;
        ctx.strokeText(healthText, textX, textY);
        ctx.fillText(healthText, textX, textY);
        
        if (this.poison) {
            const poisonY = this.y - 20;
            ctx.fillStyle = '#7fff00';
            ctx.font = 'bold 12px Arial';
            ctx.fillText('☠', textX, poisonY);
            
            ctx.strokeStyle = 'rgba(127, 255, 0, 0.5)';
            ctx.lineWidth = 3;
            ctx.setLineDash([2, 2]);
            ctx.strokeRect(this.x - 3, this.y - 3, this.size + 6, this.size + 6);
            ctx.setLineDash([]);
        }
    }
}

