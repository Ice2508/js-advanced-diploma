/**
 * Базовый класс, от которого наследуются классы персонажей
 * @property level - уровень персонажа, от 1 до 4
 * @property attack - показатель атаки
 * @property defence - показатель защиты
 * @property health - здоровье персонажа
 * @property type - строка с одним из допустимых значений:
 * swordsman, bowman, magician, daemon, undead, vampire
 */
export default class Character {
  constructor(level, type = 'generic', attack, defence, health, moveRange, attackRange) {
    if (new.target === Character) {
      throw new Error('Невозможно создать экземпляр базового класса "Character". Используйте наследника.');
    }

    this.level = level || 1;
    this.attack = attack || 0;
    this.defence = defence || 0;
    this.health = health !== undefined ? health : 50; 
    this.type = type;
    this.x = 0;
    this.y = 0;
    this.moveRange = moveRange || 0;
    this.attackRange = attackRange || 0;
  }

  canMoveTo(x, y) {
    const distanceX = Math.abs(this.x - x);
    const distanceY = Math.abs(this.y - y);
    return distanceX <= this.moveRange && distanceY <= this.moveRange;
  }

  moveTo(x, y) {
    if (this.canMoveTo(x, y)) {
      this.x = x;
      this.y = y;
      console.log(`${this.type} переместился на клетку (${x}, ${y})`);
    } else {
      console.log(`${this.type} не может переместиться на клетку (${x}, ${y})`);
    }
  }

  levelUp() {
    if (this.health <= 0) {
      throw new Error('Нельзя повысить уровень мёртвого персонажа');
    }

    this.level += 1;
    this.health = Math.min(100, this.health + 80);
    this.attack = Math.max(this.attack, this.attack * (80 + this.health) / 100);
    this.defence = Math.max(this.defence, this.defence * (80 + this.health) / 100);
  }
}
