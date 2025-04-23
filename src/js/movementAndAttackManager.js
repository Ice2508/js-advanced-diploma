export function getMoveRange(index, distance, boardSize) {
  const [x, y] = [index % boardSize, Math.floor(index / boardSize)];
  const result = [];

  for (let dx = -distance; dx <= distance; dx++) {
    for (let dy = -distance; dy <= distance; dy++) {
      const nx = x + dx;
      const ny = y + dy;

      if (nx >= 0 && nx < boardSize && ny >= 0 && ny < boardSize) {
        if (!(dx === 0 && dy === 0)) {
          result.push(ny * boardSize + nx);
        }
      }
    }
  }

  return result;
}

export function getMoveDistance(type) {
  switch (type) {
    case 'swordsman':
    case 'undead':
      return 4;
    case 'bowman':
    case 'vampire':
      return 2;
    case 'magician':
    case 'daemon':
      return 1;
    default:
      return 0;
  }
}

export function getAttackDistance(type) {
  switch (type) {
    case 'swordsman':
    case 'undead':
      return 1;
    case 'bowman':
    case 'vampire':
      return 2;
    case 'magician':
    case 'daemon':
      return 4;
    default:
      return 0;
  }
}

export function getAttackRange(position, range, boardSize) {
  const attackRange = new Set();
  const currentRow = Math.floor(position / boardSize);
  const currentCol = position % boardSize;

  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const dx = Math.abs(currentCol - col);
      const dy = Math.abs(currentRow - row);

      if (dx <= range && dy <= range) {
        const targetIndex = row * boardSize + col;
        attackRange.add(targetIndex);
      }
    }
  }

  return attackRange;
}

export async function performAttack(attacker, target, positions, gamePlay) {
  const damage = Math.round(Math.max(attacker.attack - target.defence, attacker.attack * 0.1));
  
  target.health = Math.max(0, target.health - damage);
  
  const targetPosition = positions.find(pos => pos.character === target);
  if (!targetPosition) {
    throw new Error('Позиция цели не найдена');
  }
  
  await gamePlay.showDamage(targetPosition.position, damage);
  
  gamePlay.redrawPositions(positions);
  
  const updatedPositions = positions.filter(pos => pos.character.health > 0);
  
  return updatedPositions;
}
