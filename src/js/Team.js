/**
 * Класс, представляющий персонажей команды
 *
 * @todo Самостоятельно продумайте хранение персонажей в классе
 * Например
 * @example
 * ```js
 * const characters = [new Swordsman(2), new Bowman(1)]
 * const team = new Team(characters);
 *
 * team.characters // [swordsman, bowman]
 * ```
 * */
export default class Team {
  constructor(characters = []) {
    this.characters = Array.from(characters); 
  }

  add(character) {
    this.characters.push(character);
  }

  addAll(...characters) {
    this.characters.push(...characters);
  }

  toArray() {
    return [...this.characters];
  }
}
