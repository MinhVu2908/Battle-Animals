/**
 * Tank Unit Class
 */
class TankUnit extends BaseUnit {
    static COST = 150;
    static SPAWN_COOLDOWN = 3000;
    static SIZE = 35;
    static SPEED = 1.2;
    static HEALTH = 250;
    static ATTACK_DAMAGE = 1;
    static ATTACK_COOLDOWN = 700;
    static ATTACK_RANGE = 50;

    /**
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {boolean} [isEnemy=false] - Whether this is an enemy unit
     */
    constructor(x, y, isEnemy = false) {
        super(x, y, isEnemy);
        this.isTank = true;
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
                canAttack = dist < TankUnit.ATTACK_RANGE * 1.5;
            } else {
                canAttack = dist < TankUnit.ATTACK_RANGE && 
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
        if (!this.target) return;

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
        if (now - this.lastAttack >= TankUnit.ATTACK_COOLDOWN) {
            const damage = this.levelDamage || TankUnit.ATTACK_DAMAGE;
            
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
        const fillColor = this.isEnemy ? '#555555' : '#333333';
        const borderColor = this.isEnemy ? '#333333' : '#222222';
        const blockSize = this.size;
        
        ctx.fillStyle = fillColor;
        ctx.fillRect(this.x, this.y, blockSize, blockSize);
        
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 3;
        ctx.strokeRect(this.x, this.y, blockSize, blockSize);
        
        const topBlockY = this.y - blockSize;
        ctx.fillStyle = fillColor;
        ctx.fillRect(this.x, topBlockY, blockSize, blockSize);
        
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 3;
        ctx.strokeRect(this.x, topBlockY, blockSize, blockSize);
        
        ctx.strokeStyle = 'rgba(150, 150, 150, 0.3)';
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        ctx.strokeRect(
            this.x - TankUnit.ATTACK_RANGE,
            topBlockY - TankUnit.ATTACK_RANGE / 2,
            blockSize + (TankUnit.ATTACK_RANGE * 2),
            (blockSize * 2) + TankUnit.ATTACK_RANGE
        );
        ctx.setLineDash([]);
        
        const textX = this.x + blockSize / 2;
        const textY = topBlockY - 5;
        
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        
        const healthText = `${Math.ceil(this.health)}/${this.maxHealth}`;
        ctx.strokeText(healthText, textX, textY);
        ctx.fillText(healthText, textX, textY);
    }
}
