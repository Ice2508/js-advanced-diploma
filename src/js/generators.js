import Team from './Team';

/**
 * Формирует экземпляр персонажа из массива allowedTypes с
 * указанным уровнем maxLevel
 *
 * @param allowedTypes массив классов
 * @param maxLevel целевой уровень персонажа
 * @returns генератор, который при каждом вызове
 * возвращает новый экземпляр класса персонажа
 */
export function* characterGenerator(allowedTypes, maxLevel) {
  while (true) {
    const CharacterClass = allowedTypes[Math.floor(Math.random() * allowedTypes.length)];
    yield new CharacterClass(maxLevel); 
  }
}

/**
 * Формирует массив персонажей на основе characterGenerator
 * @param allowedTypes массив классов
 * @param maxLevel целевой уровень персонажа
 * @param characterCount количество персонажей, которое нужно сформировать
 * @param currentLevel текущий уровень игры (для усиления врагов)
 * @returns экземпляр Team, хранящий экземпляры персонажей. Количество персонажей в команде - characterCount
 */
export function generateTeam(allowedTypes, maxLevel, characterCount, currentLevel = 1) {
  const generator = characterGenerator(allowedTypes, maxLevel);
  const characters = [];

  for (let i = 0; i < characterCount; i++) {
    const character = generator.next().value;
    
    if (currentLevel > 1) {
      const strengthMultiplier = Math.pow(2, currentLevel - 1); 
      character.attack *= strengthMultiplier;
      character.defence *= strengthMultiplier;
    }

    characters.push(character);
  }

  return new Team(characters);
}
