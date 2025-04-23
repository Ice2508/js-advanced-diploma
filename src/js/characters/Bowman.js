import Character from '../Character';

export default class Bowman extends Character {
  constructor(level, attack, defence, health, moveRange, attackRange) {
    super(level, 'bowman', attack, defence, health, moveRange, attackRange);
    this.attack = attack !== undefined ? attack : 25;
    this.defence = defence !== undefined ? defence : 25;
    this.moveRange = moveRange !== undefined ? moveRange : 2;
    this.attackRange = attackRange !== undefined ? attackRange : 2;
  }
}
