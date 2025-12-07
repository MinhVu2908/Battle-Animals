/**
 * Draw ground
 */
function drawGround() {
    ctx.fillStyle = '#2d5016';
    ctx.fillRect(0, CONFIG.GROUND_Y, CONFIG.CANVAS_WIDTH, CONFIG.GROUND_HEIGHT);
    
    ctx.strokeStyle = '#1a3009';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, CONFIG.GROUND_Y);
    ctx.lineTo(CONFIG.CANVAS_WIDTH, CONFIG.GROUND_Y);
    ctx.stroke();
}

/**
 * Draw base
 * @param {Object} base - Base object to draw
 * @param {boolean} isPlayer - Whether this is the player base
 */
function drawBase(base, isPlayer) {
    const color = isPlayer ? '#e94560' : '#f39c12';
    const borderColor = isPlayer ? '#c0392b' : '#d68910';
    
    ctx.fillStyle = color;
    ctx.fillRect(base.x, base.y, base.width, base.height);
    
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(base.x, base.y, base.width, base.height);
    
    const textX = base.x + base.width / 2;
    const textY = base.y - 8;
    const maxHealth = base.maxHealth || 2000;
    
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    
    const healthText = `${Math.ceil(base.health)}/${maxHealth}`;
    ctx.strokeText(healthText, textX, textY);
    ctx.fillText(healthText, textX, textY);
    
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(isPlayer ? 'Your Base' : 'Enemy Base', base.x + base.width / 2, base.y + base.height / 2);
}
