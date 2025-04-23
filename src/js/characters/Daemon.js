import Character from '../Character';

export default class Daemon extends Character {
  constructor(level, attack, defence, health, moveRange, attackRange) {
    super(level, 'daemon', attack, defence, health, moveRange, attackRange);
    this.attack = attack !== undefined ? attack : 10;
    this.defence = defence !== undefined ? defence : 10;
    this.moveRange = moveRange !== undefined ? moveRange : 1;
    this.attackRange = attackRange !== undefined ? attackRange : 4;
    for (let i = 1; i < level; i++) {
      this.health = Math.min(100, this.health + 80);
      this.attack = Math.max(this.attack, this.attack * (80 + this.health) / 100);
      this.defence = Math.max(this.defence, this.defence * (80 + this.health) / 100);
    }
  }
}
