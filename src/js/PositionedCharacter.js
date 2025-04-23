import Character from './Character';

export default class PositionedCharacter {
  constructor(character, position) {
    if (!(character instanceof Character)) {
      throw new Error('Переданный объект не экземпляр класса character');
    }

    if (typeof position !== 'number') {
      throw new Error('значение position не number');
    }

    this.character = character;
    this.position = position;
  }
}
