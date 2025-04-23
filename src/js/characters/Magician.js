import Character from '../Character';

export default class Magician extends Character {
  constructor(level, attack, defence, health, moveRange, attackRange) {
    super(level, 'magician', attack, defence, health, moveRange, attackRange);
    this.attack = attack !== undefined ? attack : 10;
    this.defence = defence !== undefined ? defence : 40;
    this.moveRange = moveRange !== undefined ? moveRange : 1;
    this.attackRange = attackRange !== undefined ? attackRange : 4;
  }
}
