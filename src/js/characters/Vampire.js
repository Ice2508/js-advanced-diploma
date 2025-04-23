import Character from '../Character';

export default class Vampire extends Character {
  constructor(level, attack, defence, health, moveRange, attackRange) {
    super(level, 'vampire', attack, defence, health, moveRange, attackRange);
    this.attack = attack !== undefined ? attack : 25;
    this.defence = defence !== undefined ? defence : 25;
    this.moveRange = moveRange !== undefined ? moveRange : 2;
    this.attackRange = attackRange !== undefined ? attackRange : 2;
    for (let i = 1; i < level; i++) {
      this.health = Math.min(100, this.health + 80);
      this.attack = Math.max(this.attack, this.attack * (80 + this.health) / 100);
      this.defence = Math.max(this.defence, this.defence * (80 + this.health) / 100);
    }
  }
}
