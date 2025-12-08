/**
 * Suicide Bomber Unit Class
 */
class SuicideBomberUnit extends BaseUnit {
    static COST = 300;
    static SPAWN_COOLDOWN = 5000;
    static SIZE = 30;
    static SPEED = 3.5;
    static HEALTH = 5;
    static EXPLOSION_DAMAGE = 30;
    static EXPLOSION_RADIUS = 80;

    /**
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {boolean} [isEnemy=false] - Whether this is an enemy unit
     */
    constructor(x, y, isEnemy = false) {
        super(x, y, isEnemy);
        this.hasExploded = false;
        this.isBomber = true;
    }

    /**
     * Update unit position and explosion logic
     */
    update() {
        if (this.hasExploded) return;
        
        this.x += this.speed * this.direction;
        
        const targetBase = this.isEnemy ? gameState.playerBase : gameState.enemyBase;
        const hasReachedBase = this.isEnemy
            ? (this.x <= targetBase.x + targetBase.width)
            : (this.x + this.size >= targetBase.x);
        
        if (hasReachedBase && !this.hasExploded) {
            this.explode();
            return;
        }
        
        const enemyUnits = this.isEnemy ? gameState.units : gameState.enemyUnits;
        for (const enemy of enemyUnits) {
            if (!enemy.isAlive() || enemy.isBomber) continue;
            
            const dx = (this.x + this.size / 2) - (enemy.x + enemy.size / 2);
            const dy = (this.y + this.size / 2) - (enemy.y + enemy.size / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.size + enemy.size) {
                this.explode();
                return;
            }
        }
        
        super.update();
    }

    /**
     * Explode the unit, creating an explosion effect
     */
    explode() {
        if (this.hasExploded) return;
        
        this.hasExploded = true;
        const explosionX = this.x + this.size / 2;
        const explosionY = this.y + this.size / 2;
        
        const explosionDamage = this.levelExplosionDamage || SuicideBomberUnit.EXPLOSION_DAMAGE;
        
        gameState.explosions.push(new Explosion(
            explosionX,
            explosionY,
            explosionDamage,
            SuicideBomberUnit.EXPLOSION_RADIUS,
            this.isEnemy
        ));
        
        this.health = 0;
    }

    /**
     * @param {number} amount - Amount of damage to apply
     */
    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            if (!this.hasExploded) {
                this.explode();
            }
        }
    }

    /**
     * Draw the unit on the canvas
     */
    draw() {
        if (this.hasExploded) return;
        
        const fillColor = this.isEnemy ? '#8b0000' : '#ff4444';
        const borderColor = this.isEnemy ? '#ff0000' : '#ff0000';
        
        ctx.fillStyle = fillColor;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 3;
        ctx.strokeRect(this.x, this.y, this.size, this.size);
        
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(this.x + 5, this.y + 5);
        ctx.lineTo(this.x + this.size - 5, this.y + this.size - 5);
        ctx.moveTo(this.x + this.size - 5, this.y + 5);
        ctx.lineTo(this.x + 5, this.y + this.size - 5);
        ctx.stroke();
        
        if (this.health < this.maxHealth) {
            const barWidth = this.size;
            const barHeight = 4;
            const barX = this.x;
            const barY = this.y - 8;
            
            ctx.fillStyle = '#333';
            ctx.fillRect(barX, barY, barWidth, barHeight);
            
            const healthPercent = this.health / this.maxHealth;
            ctx.fillStyle = healthPercent > 0.5 ? '#ff8800' : '#ff0000';
            ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
        }
    }

    /**
     * @returns {boolean} - True if unit is alive and hasn't exploded
     */
    isAlive() {
        return super.isAlive() && !this.hasExploded;
    }
}
