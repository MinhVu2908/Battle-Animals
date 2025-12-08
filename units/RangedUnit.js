/**
 * Ranged Unit Class
 */
class RangedUnit extends BaseUnit {
    static COST = 200;
    static SPAWN_COOLDOWN = 5000;
    static SIZE = 30;
    static SPEED = 1.4;
    static HEALTH = 40;
    static ATTACK_DAMAGE = 8;
    static ATTACK_COOLDOWN = 1000;
    static ATTACK_RANGE = 200;

    /**
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {boolean} [isEnemy=false] - Whether this is an enemy unit
     */
    constructor(x, y, isEnemy = false) {
        super(x, y, isEnemy);
        this.isRanged = true;
    }

    /**
     * Find the nearest target to attack
     */
    findTarget() {
        const enemyUnits = this.isEnemy ? gameState.units : gameState.enemyUnits;
        let nearest = null;
        let nearestDist = Infinity;

        const targetBase = this.isEnemy ? gameState.playerBase : gameState.enemyBase;
        const distToBase = Math.abs(this.x - (targetBase.x + targetBase.width / 2));
        const isAtBase = distToBase < targetBase.width + this.size;

        for (const enemy of enemyUnits) {
            if (!enemy.isAlive()) continue;
            
            const dist = Math.abs(this.x - enemy.x);
            let canAttack = false;
            
            if (isAtBase) {
                canAttack = dist < RangedUnit.ATTACK_RANGE;
            } else {
                canAttack = dist < RangedUnit.ATTACK_RANGE &&
                    ((this.isEnemy && enemy.x < this.x) || (!this.isEnemy && enemy.x > this.x));
            }
            
            if (canAttack) {
                if (dist < nearestDist) {
                    nearest = enemy;
                    nearestDist = dist;
                }
            }
        }

        if (!nearest) {
            if (distToBase < RangedUnit.ATTACK_RANGE && targetBase.health > 0) {
                nearest = targetBase;
                nearestDist = distToBase;
            }
        }

        this.target = nearest;
        this.isStopped = nearest !== null;
    }

    /**
     * Update unit position and combat logic
     */
    update() {
        this.findTarget();
        
        if (!this.target) {
            this.isStopped = false;
            this.x += this.speed * this.direction;
        } else {
            this.attack();
        }
        
        super.update();
    }

    /**
     * Attack the current target
     */
    attack() {
        if (!this.target) return;

        const isTargetAlive = this.target.isAlive ? this.target.isAlive() : (this.target.health > 0);
        if (!isTargetAlive) {
            this.target = null;
            return;
        }

        const now = Date.now();
        if (now - this.lastAttack >= RangedUnit.ATTACK_COOLDOWN) {
            const damage = this.levelDamage || RangedUnit.ATTACK_DAMAGE;
            
            const targetX = this.target.x + (this.target.size || this.target.width) / 2;
            const targetY = this.target.y + (this.target.size || this.target.height) / 2;
            const startX = this.x + this.size / 2;
            const startY = this.y + this.size / 2;
            
            gameState.projectiles.push(new Projectile(
                startX, startY, targetX, targetY, 
                damage, this.isEnemy
            ));
            
            this.lastAttack = now;
        }
    }

    /**
     * Draw the unit on the canvas
     */
    draw() {
        const fillColor = this.isEnemy ? '#ff6b35' : '#f9ca24';
        const borderColor = this.isEnemy ? '#d63031' : '#f39c12';
        
        ctx.fillStyle = fillColor;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.size, this.size);
        
        ctx.strokeStyle = 'rgba(255, 200, 0, 0.3)';
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        ctx.strokeRect(
            this.x - RangedUnit.ATTACK_RANGE,
            this.y - RangedUnit.ATTACK_RANGE / 2,
            this.size + (RangedUnit.ATTACK_RANGE * 2),
            this.size + RangedUnit.ATTACK_RANGE
        );
        ctx.setLineDash([]);
        
        this.drawHealthBar();
    }
}
