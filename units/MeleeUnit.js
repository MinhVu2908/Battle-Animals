/**
 * Melee Unit Class
 */
class MeleeUnit extends BaseUnit {
    // Unit Stats
    static COST = 50;
    static SPAWN_COOLDOWN = 2000; // Cooldown between spawns in ms
    static SIZE = 30;
    static SPEED = 2;
    static HEALTH = 50;
    static ATTACK_DAMAGE = 5;
    static ATTACK_COOLDOWN = 500; // Attack every 500ms
    static ATTACK_RANGE = 50; // Range at which units can attack each other

    /**
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {boolean} [isEnemy=false] - Whether this is an enemy unit
     */
    constructor(x, y, isEnemy = false) {
        super(x, y, isEnemy);
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
                canAttack = dist < MeleeUnit.ATTACK_RANGE * 1.5;
            } else {
                canAttack = dist < MeleeUnit.ATTACK_RANGE && 
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

        // Check if target is alive (for units) or has health (for bases)
        const isTargetAlive = this.target.isAlive ? this.target.isAlive() : (this.target.health > 0);
        if (!isTargetAlive) {
            // Remove from base attacking units if it was a base
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
        if (now - this.lastAttack >= MeleeUnit.ATTACK_COOLDOWN) {
            const damage = this.levelDamage || MeleeUnit.ATTACK_DAMAGE;
            
            if (this.target.takeDamage) {
                this.target.takeDamage(damage);
            } else if (this.target.health !== undefined) {
                this.target.health -= damage;
                if (this.target.health < 0) {
                    this.target.health = 0;
                }
            }
            this.lastAttack = now;
        }
    }

    /**
     * Draw the unit on the canvas
     */
    draw() {
        const fillColor = this.isEnemy ? '#e74c3c' : '#4a90e2';
        const borderColor = this.isEnemy ? '#c0392b' : '#2c5f8d';
        
        ctx.fillStyle = fillColor;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        
        // Draw border
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.size, this.size);
        
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        ctx.strokeRect(
            this.x - MeleeUnit.ATTACK_RANGE, 
            this.y - MeleeUnit.ATTACK_RANGE / 2, 
            this.size + (MeleeUnit.ATTACK_RANGE * 2), 
            this.size + MeleeUnit.ATTACK_RANGE
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

    /**
     * Draw a line from this unit to its target for debugging
     */
    drawAttackLine() {
        if (this.target && this.target.isAlive !== undefined) {
            if (this.target.isAlive && this.target.isAlive()) {
                ctx.strokeStyle = '#ff0000';
                ctx.lineWidth = 2;
                ctx.setLineDash([3, 3]);
                ctx.beginPath();
                ctx.moveTo(this.x + this.size / 2, this.y + this.size / 2);
                
                if (this.target.x !== undefined) {
                    ctx.lineTo(this.target.x + this.target.size / 2, this.target.y + this.target.size / 2);
                }
                ctx.stroke();
                ctx.setLineDash([]);
            }
        }
    }

}

