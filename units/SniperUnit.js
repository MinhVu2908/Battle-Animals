/**
 * Sniper Unit Class - High damage, long range, very slow
 */
class SniperUnit extends BaseUnit {
    static COST = 50;
    static SPAWN_COOLDOWN = 10000;
    static SIZE = 30;
    static SPEED = 0.6;
    static HEALTH = 60;
    static ATTACK_DAMAGE = 50;
    static ATTACK_COOLDOWN = 2500;
    static ATTACK_RANGE = 350;

    /**
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {boolean} [isEnemy=false] - Whether this is an enemy unit
     */
    constructor(x, y, isEnemy = false) {
        super(x, y, isEnemy);
        this.isRanged = true;
        this.isSniper = true;
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
                canAttack = dist < SniperUnit.ATTACK_RANGE;
            } else {
                canAttack = dist < SniperUnit.ATTACK_RANGE &&
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
            if (distToBase < SniperUnit.ATTACK_RANGE && targetBase.health > 0) {
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
        if (now - this.lastAttack >= SniperUnit.ATTACK_COOLDOWN) {
            const damage = this.levelDamage || SniperUnit.ATTACK_DAMAGE;
            
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
        const fillColor = this.isEnemy ? '#8e44ad' : '#9b59b6';
        const borderColor = this.isEnemy ? '#6c3483' : '#7d3c98';
        
        ctx.fillStyle = fillColor;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.size, this.size);
        
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        const centerX = this.x + this.size / 2;
        const centerY = this.y + this.size / 2;
        ctx.moveTo(centerX - this.size / 3, centerY);
        ctx.lineTo(centerX + this.size / 3, centerY);
        ctx.moveTo(centerX, centerY - this.size / 3);
        ctx.lineTo(centerX, centerY + this.size / 3);
        ctx.stroke();
        
        ctx.strokeStyle = 'rgba(156, 89, 182, 0.3)';
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        ctx.strokeRect(
            this.x - SniperUnit.ATTACK_RANGE,
            this.y - SniperUnit.ATTACK_RANGE / 2,
            this.size + (SniperUnit.ATTACK_RANGE * 2),
            this.size + SniperUnit.ATTACK_RANGE
        );
        ctx.setLineDash([]);
        
        this.drawHealthBar();
    }
}
