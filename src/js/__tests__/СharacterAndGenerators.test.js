import Character from '../Character';
import Magician from '../characters/Magician';
import { characterGenerator, generateTeam } from '../generators';

const MockBowman = class Bowman extends Character {
  constructor(level) {
    super(level, 'bowman');
    this.attack = 25;
    this.defence = 25;
    this.health = 50;
  }
};

describe('Character base class', () => {
  test('should throw error when trying to instantiate Character directly', () => {
    expect(() => {
      new Character(1);
    }).toThrow('Невозможно создать экземпляр базового класса "Character". Используйте наследника.');
  });

  test('should not throw error when creating inherited class', () => {
    expect(() => {
      new Magician(1);
    }).not.toThrow();
  });
});

test('should create level 1 character with correct default properties', () => {
  const character = new Magician(1);
  expect(character.level).toBe(1);
  expect(character.health).toBe(50);
  expect(character.attack).toBeGreaterThanOrEqual(0);
  expect(character.defence).toBeGreaterThanOrEqual(0);
  expect(character.type).toBe('magician');
});

describe('Character', () => {
  test('should throw error when instantiated directly', () => {
    expect(() => new Character(1, 'generic')).toThrow('Невозможно создать экземпляр базового класса "Character". Используйте наследника.');
  });

  test('should allow instantiation of Magician subclass with correct properties', () => {
    const magician = new Magician(1);
    expect(magician).toBeInstanceOf(Magician);
    expect(magician).toBeInstanceOf(Character);
    expect(magician.level).toBe(1);
    expect(magician.type).toBe('magician');
    expect(magician.attack).toBe(10);
    expect(magician.defence).toBe(40);
    expect(magician.health).toBe(50);
  });
});

describe('characterGenerator', () => {
  test('should generate characters from allowedTypes', () => {
    const allowedTypes = [Magician, MockBowman];
    const generator = characterGenerator(allowedTypes, 2);
    const character = generator.next().value;
    expect(['magician', 'bowman']).toContain(character.type);
    expect([1, 2]).toContain(character.level);
  });

  test('should generate infinite characters', () => {
    const allowedTypes = [Magician];
    const generator = characterGenerator(allowedTypes, 1);
    const characters = [];
    for (let i = 0; i < 10; i++) {
      characters.push(generator.next().value);
    }
    expect(characters.length).toBe(10);
    expect(characters.every(c => c.type === 'magician')).toBe(true);
    expect(characters.every(c => c.level === 1)).toBe(true);
  });
});

describe('generateTeam', () => {
  test('should generate team with correct number of characters', () => {
    const allowedTypes = [Magician, MockBowman];
    const team = generateTeam(allowedTypes, 2, 3);
    expect(team.characters.length).toBe(3);
  });

  test('should generate characters within maxLevel range', () => {
    const allowedTypes = [Magician, MockBowman];
    const team = generateTeam(allowedTypes, 3, 4);
    expect(team.characters.every(c => c.level >= 1 && c.level <= 3)).toBe(true);
  });

  test('should generate characters from allowedTypes', () => {
    const allowedTypes = [Magician, MockBowman];
    const team = generateTeam(allowedTypes, 2, 4);
    expect(team.characters.every(c => ['magician', 'bowman'].includes(c.type))).toBe(true);
  });
});
