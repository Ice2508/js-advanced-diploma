export function computerTurn(context) {
  if (context.isGameOver) return;

  if (context.gameState.getCurrentPlayer() !== 'computer') return;

  const computerCharacters = context.positionedCharacters.filter(pc => !context.isPlayer(pc.character));
  const playerCharacters = context.positionedCharacters.filter(pc => context.isPlayer(pc.character));

  if (computerCharacters.length === 0 || playerCharacters.length === 0) {
    context.checkGameEnd();
    return;
  }

  const computerChar = computerCharacters[Math.floor(Math.random() * computerCharacters.length)];

  let closestEnemy = null;
  let minDistance = Infinity;

  for (const playerChar of playerCharacters) {
    const distance = context.calculateDistance(computerChar.position, playerChar.position);
    if (distance < minDistance) {
      minDistance = distance;
      closestEnemy = playerChar;
    }
  }

  if (!closestEnemy) return;

  const attackRange = context.getAttackRange(
    computerChar.position,
    context.getAttackDistance(computerChar.character.type)
  );

  if (attackRange.has(closestEnemy.position)) {
    context.performAttack(computerChar.character, closestEnemy.character, context.positionedCharacters)
      .then(updatedPositions => {
        context.positionedCharacters = updatedPositions;
        context.gamePlay.redrawPositions(context.positionedCharacters);

        if (closestEnemy.character.health <= 0) {
          context.gameState.addScore(100);
        }

        context.checkGameEnd();
        context.gameState.togglePlayer();
      })
      .catch(error => {
        console.error('Ошибка при выполнении атаки:', error);
        context.gameState.togglePlayer();
      });
  } else {
    const moveRange = context.getMoveRange(
      computerChar.position,
      context.getMoveDistance(computerChar.character.type)
    );

    let targetPosition = computerChar.position;
    let minDistanceToEnemy = context.calculateDistance(computerChar.position, closestEnemy.position);

    for (const pos of moveRange) {
      if (!context.positionedCharacters.some(pc => pc.position === pos)) {
        const distanceToEnemy = context.calculateDistance(pos, closestEnemy.position);
        if (distanceToEnemy < minDistanceToEnemy) {
          minDistanceToEnemy = distanceToEnemy;
          targetPosition = pos;
        }
      }
    }

    if (targetPosition !== computerChar.position) {
      computerChar.position = targetPosition;
      context.gamePlay.redrawPositions(context.positionedCharacters);
    }

    context.gameState.togglePlayer();
  }
}
