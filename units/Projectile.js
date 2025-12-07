/**
 * Projectile Class
 */
class Projectile {
    static SIZE = 8;
    static SPEED = 8;

    /**
     * @param {number} x - Starting X position
     * @param {number} y - Starting Y position
     * @param {number} targetX - Target X position
     * @param {number} targetY - Target Y position
     * @param {number} damage - Damage dealt by this projectile
     * @param {boolean} isEnemy - Whether this is an enemy projectile
     */
    constructor(x, y, targetX, targetY, damage, isEnemy) {
        this.x = x;
        this.y = y;
        this.damage = damage;
        this.isEnemy = isEnemy;
        this.size = Projectile.SIZE;
        
        const dx = targetX - x;
        const dy = targetY - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        this.vx = (dx / distance) * Projectile.SPEED;
        this.vy = (dy / distance) * Projectile.SPEED;
    }

    /**
     * Update projectile position
     * @returns {boolean} - True if projectile should be kept, false if it should be removed
     */
    update() {
        this.x += this.vx;
        this.y += this.vy;
        
        if (this.x < 0 || this.x > CONFIG.CANVAS_WIDTH || 
            this.y < 0 || this.y > CONFIG.CANVAS_HEIGHT) {
            return false;
        }
        return true;
    }

    /**
     * Draw the projectile on the canvas
     */
    draw() {
        ctx.fillStyle = this.isEnemy ? '#ff0000' : '#ffff00';
        ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
    }

    /**
     * Check if projectile hits a target
     * @param {Object} target - The target to check (unit or base)
     * @returns {boolean} - True if projectile hits the target
     */
    checkHit(target) {
        if (target.x !== undefined && target.size !== undefined) {
            return this.x >= target.x && this.x <= target.x + target.size &&
                   this.y >= target.y && this.y <= target.y + target.size;
        } else if (target.width !== undefined) {
            return this.x >= target.x && this.x <= target.x + target.width &&
                   this.y >= target.y && this.y <= target.y + target.height;
        }
        return false;
    }
}
