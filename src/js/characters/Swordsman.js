import Character from '../Character';

export default class Swordsman extends Character {
  constructor(level, attack, defence, health, moveRange, attackRange) {
    super(level, 'swordsman', attack, defence, health, moveRange, attackRange);
    this.attack = attack !== undefined ? attack : 40;
    this.defence = defence !== undefined ? defence : 10;
    this.moveRange = moveRange !== undefined ? moveRange : 4;
    this.attackRange = attackRange !== undefined ? attackRange : 1;
  }
}
