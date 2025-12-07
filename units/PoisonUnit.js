/**
 * Poison Unit Class - Applies poison damage over time
 */
class PoisonUnit extends BaseUnit {
    static COST = 35;
    static SPAWN_COOLDOWN = 1800;
    static SIZE = 30;
    static SPEED = 1.5;
    static HEALTH = 45;
    static ATTACK_DAMAGE = 3;
    static ATTACK_COOLDOWN = 800;
    static ATTACK_RANGE = 60;
    static POISON_DAMAGE = 2;
    static POISON_DURATION = 5000;
    static POISON_TICK_INTERVAL = 500;

    /**
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {boolean} [isEnemy=false] - Whether this is an enemy unit
     */
    constructor(x, y, isEnemy = false) {
        super(x, y, isEnemy);
        this.isPoison = true;
    }

    /**
     * @param {BaseUnit} other - The other unit to check collision with
     * @returns {boolean} - True if units are colliding
     */
    checkCollision(other) {
        return this.x < other.x + other.size &&
               this.x + this.size > other.x &&
               Math.abs(this.y - other.y) < this.size;
    }

    /**
     * Find the nearest target to attack
     */
    findTarget() {
        const enemyUnits = this.isEnemy ? gameState.units : gameState.enemyUnits;
        let nearest = null;
        let nearestDist = Infinity;

        const targetBase = this.isEnemy ? gameState.playerBase : gameState.enemyBase;
        const isAtBase = this.isEnemy 
            ? (this.x <= targetBase.x + targetBase.width && this.x + this.size >= targetBase.x)
            : (this.x + this.size >= targetBase.x && this.x <= targetBase.x + targetBase.width);

        for (const enemy of enemyUnits) {
            if (!enemy.isAlive()) continue;
            
            const dist = Math.abs(this.x - enemy.x);
            let canAttack = false;
            
            if (isAtBase) {
                canAttack = dist < PoisonUnit.ATTACK_RANGE * 1.5;
            } else {
                canAttack = dist < PoisonUnit.ATTACK_RANGE && 
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
            if (isAtBase && targetBase.health > 0) {
                nearest = targetBase;
                nearestDist = 0;
                if (!targetBase.attackingUnits.includes(this)) {
                    targetBase.attackingUnits.push(this);
                }
            } else {
                const index = targetBase.attackingUnits.indexOf(this);
                if (index > -1) {
                    targetBase.attackingUnits.splice(index, 1);
                }
            }
        } else {
            const playerBaseIndex = gameState.playerBase.attackingUnits.indexOf(this);
            if (playerBaseIndex > -1) {
                gameState.playerBase.attackingUnits.splice(playerBaseIndex, 1);
            }
            const enemyBaseIndex = gameState.enemyBase.attackingUnits.indexOf(this);
            if (enemyBaseIndex > -1) {
                gameState.enemyBase.attackingUnits.splice(enemyBaseIndex, 1);
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
            
            if (this.target === gameState.playerBase || this.target === gameState.enemyBase) {
                if (this.isEnemy) {
                    this.x = Math.min(this.x, gameState.playerBase.x + gameState.playerBase.width);
                } else {
                    this.x = Math.max(this.x, gameState.enemyBase.x - this.size);
                }
            }
        }
        
        super.update();
    }

    /**
     * Attack the current target
     */
    attack() {
        if (!this.target) {
            return;
        }

        const isTargetAlive = this.target.isAlive ? this.target.isAlive() : (this.target.health > 0);
        if (!isTargetAlive) {
            if (this.target === gameState.playerBase || this.target === gameState.enemyBase) {
                const index = this.target.attackingUnits.indexOf(this);
                if (index > -1) {
                    this.target.attackingUnits.splice(index, 1);
                }
            }
            this.target = null;
            return;
        }

        const now = Date.now();
        if (now - this.lastAttack >= PoisonUnit.ATTACK_COOLDOWN) {
            const damage = this.levelDamage || PoisonUnit.ATTACK_DAMAGE;
            
            if (this.target.takeDamage) {
                this.target.takeDamage(damage);
            } else if (this.target.health !== undefined) {
                this.target.health -= damage;
                if (this.target.health < 0) {
                    this.target.health = 0;
                }
            }
            
            if (this.target.takeDamage && this.target.isAlive) {
                const poisonDamage = this.levelPoisonDamage || PoisonUnit.POISON_DAMAGE;
                applyPoison(this.target, poisonDamage, PoisonUnit.POISON_DURATION, PoisonUnit.POISON_TICK_INTERVAL);
            }
            
            this.lastAttack = now;
        }
    }

    /**
     * Draw the unit on the canvas
     */
    draw() {
        const fillColor = this.isEnemy ? '#2d5016' : '#4a7c2a';
        const borderColor = this.isEnemy ? '#1a3009' : '#2d5016';
        
        ctx.fillStyle = fillColor;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.size, this.size);
        
        ctx.fillStyle = '#7fff00';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('☠', this.x + this.size / 2, this.y + this.size / 2);
        
        ctx.strokeStyle = 'rgba(76, 175, 80, 0.3)';
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        ctx.strokeRect(
            this.x - PoisonUnit.ATTACK_RANGE, 
            this.y - PoisonUnit.ATTACK_RANGE / 2, 
            this.size + (PoisonUnit.ATTACK_RANGE * 2), 
            this.size + PoisonUnit.ATTACK_RANGE
        );
        ctx.setLineDash([]);
        
        if (this.isBeingAttacked()) {
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 4;
            ctx.setLineDash([5, 5]);
            ctx.strokeRect(this.x - 8, this.y - 8, this.size + 16, this.size + 16);
            ctx.setLineDash([]);
        }
        
        this.drawHealthBar();
    }
}

/**
 * Apply poison effect to a unit
 * @param {BaseUnit} unit - The unit to apply poison to
 * @param {number} damagePerTick - Damage per tick
 * @param {number} duration - Duration in milliseconds
 * @param {number} tickInterval - Interval between ticks in milliseconds
 */
function applyPoison(unit, damagePerTick, duration, tickInterval) {
    const now = Date.now();
    
    if (!unit.poison) {
        unit.poison = {
            damagePerTick: damagePerTick,
            duration: duration,
            tickInterval: tickInterval,
            startTime: now,
            lastTickTime: now
        };
    } else {
        unit.poison.startTime = now;
        unit.poison.lastTickTime = now;
        if (damagePerTick > unit.poison.damagePerTick) {
            unit.poison.damagePerTick = damagePerTick;
        }
    }
}
