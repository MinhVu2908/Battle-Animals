/**
 * Explosion Class
 */
class Explosion {
    /**
     * @param {number} x - X position of explosion
     * @param {number} y - Y position of explosion
     * @param {number} damage - Damage dealt by explosion
     * @param {number} radius - Radius of explosion
     * @param {boolean} isEnemy - Whether this is an enemy explosion
     */
    constructor(x, y, damage, radius, isEnemy) {
        this.x = x;
        this.y = y;
        this.damage = damage;
        this.radius = radius;
        this.isEnemy = isEnemy;
        this.maxRadius = radius;
        this.currentRadius = 0;
        this.duration = 300;
        this.startTime = Date.now();
        this.damageDealt = false;
    }

    /**
     * Update explosion animation
     * @returns {boolean} - True if explosion is still active
     */
    update() {
        const elapsed = Date.now() - this.startTime;
        const progress = Math.min(elapsed / this.duration, 1);
        
        this.currentRadius = this.maxRadius * progress;
        
        if (!this.damageDealt && progress >= 0.8) {
            this.dealDamage();
            this.damageDealt = true;
        }
        
        return progress < 1;
    }

    /**
     * Deal damage to units and bases within explosion radius
     */
    dealDamage() {
        const targetUnits = this.isEnemy ? gameState.units : gameState.enemyUnits;
        for (const unit of targetUnits) {
            if (!unit.isAlive()) continue;
            
            const dx = (unit.x + unit.size / 2) - this.x;
            const dy = (unit.y + unit.size / 2) - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= this.radius) {
                unit.takeDamage(this.damage);
            }
        }
        
        const targetBase = this.isEnemy ? gameState.playerBase : gameState.enemyBase;
        const baseCenterX = targetBase.x + targetBase.width / 2;
        const baseCenterY = targetBase.y + targetBase.height / 2;
        const dx = baseCenterX - this.x;
        const dy = baseCenterY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance <= this.radius && targetBase.health > 0) {
            targetBase.health -= this.damage;
            if (targetBase.health < 0) {
                targetBase.health = 0;
            }
        }
    }

    /**
     * Draw the explosion on the canvas
     */
    draw() {
        const progress = Math.min((Date.now() - this.startTime) / this.duration, 1);
        const alpha = 1 - progress;
        
        ctx.save();
        ctx.globalAlpha = alpha;
        
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.currentRadius);
        gradient.addColorStop(0, this.isEnemy ? 'rgba(255, 0, 0, 0.8)' : 'rgba(255, 165, 0, 0.8)');
        gradient.addColorStop(0.5, this.isEnemy ? 'rgba(255, 100, 0, 0.5)' : 'rgba(255, 200, 0, 0.5)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.currentRadius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = this.isEnemy ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.currentRadius * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}
