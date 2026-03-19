const TILE_SIZE = 64;

const STATE = {
  IDLE: 'idle',
  CALLED: 'called',
  RETURNING: 'returning',
};

const DIRECTIONS = ['down', 'left', 'right', 'up'];

export class NPCBehavior {
  constructor(agentData, spawnX, spawnY) {
    this.agentId = agentData.id;
    this.spawnX = spawnX;
    this.spawnY = spawnY;
    this.targetX = spawnX;
    this.targetY = spawnY;

    this.state = STATE.IDLE;
    this.direction = 'down'; // all face down — clean formation
    this.stateTimer = 0;

    // Occasionally look around
    this._lookTimer = Math.random() * 15000;
    this._lookInterval = 8000 + Math.random() * 12000;

    this._calledSpeed = 220;
    this.speed = 120;
  }

  initPosition() {
    return { x: this.spawnX, y: this.spawnY, direction: this.direction, isSitting: false };
  }

  update(deltaMs, currentX, currentY) {
    this.stateTimer += deltaMs;

    switch (this.state) {
      case STATE.IDLE:
        return this._updateIdle();
      case STATE.CALLED:
        return this._updateCalled(deltaMs, currentX, currentY);
      case STATE.RETURNING:
        return this._updateReturning(deltaMs, currentX, currentY);
      default:
        return null;
    }
  }

  callToPosition(targetX, targetY) {
    this.targetX = targetX;
    this.targetY = targetY;
    this.state = STATE.CALLED;
    this.stateTimer = 0;
  }

  returnToSpawn() {
    this.targetX = this.spawnX;
    this.targetY = this.spawnY;
    this.state = STATE.RETURNING;
    this.stateTimer = 0;
  }

  _updateIdle() {
    // Occasionally change direction to look alive
    this._lookTimer += 500;
    if (this._lookTimer >= this._lookInterval) {
      this._lookTimer = 0;
      this._lookInterval = 8000 + Math.random() * 12000;
      const newDir = DIRECTIONS[Math.floor(Math.random() * 4)];
      if (newDir !== this.direction) {
        this.direction = newDir;
        return { type: 'idle', direction: this.direction };
      }
    }
    return null;
  }

  _updateCalled(deltaMs, currentX, currentY) {
    const dx = this.targetX - currentX;
    const dy = this.targetY - currentY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    this.direction = Math.abs(dx) > Math.abs(dy)
      ? (dx > 0 ? 'right' : 'left')
      : (dy > 0 ? 'down' : 'up');

    if (dist < 40) {
      this.state = STATE.IDLE;
      this.stateTimer = 0;
      return { type: 'arrived', direction: this.direction };
    }

    const moveAmount = (this._calledSpeed * deltaMs) / 1000;
    return {
      type: 'move',
      x: currentX + (dx / dist) * Math.min(moveAmount, dist),
      y: currentY + (dy / dist) * Math.min(moveAmount, dist),
      direction: this.direction,
    };
  }

  _updateReturning(deltaMs, currentX, currentY) {
    const dx = this.targetX - currentX;
    const dy = this.targetY - currentY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    this.direction = Math.abs(dx) > Math.abs(dy)
      ? (dx > 0 ? 'right' : 'left')
      : (dy > 0 ? 'down' : 'up');

    if (dist < 6) {
      this.state = STATE.IDLE;
      this.direction = 'down';
      return { type: 'idle', direction: 'down' };
    }

    const moveAmount = (this.speed * deltaMs) / 1000;
    return {
      type: 'move',
      x: currentX + (dx / dist) * Math.min(moveAmount, dist),
      y: currentY + (dy / dist) * Math.min(moveAmount, dist),
      direction: this.direction,
    };
  }
}
