import themes from './themes';
import GamePlay from './GamePlay';
import { generateTeam } from './generators';
import Team from './Team';
import PositionedCharacter from './PositionedCharacter';
import Bowman from './characters/Bowman';
import Swordsman from './characters/Swordsman';
import Magician from './characters/Magician';
import Vampire from './characters/Vampire';
import Undead from './characters/Undead';
import Daemon from './characters/Daemon';
import { formatCharacterInfo } from './utils';
import GameState from './GameState';
import { computerTurn } from './computerAI.js';
import {
  getMoveRange,
  getMoveDistance,
  getAttackDistance,
  getAttackRange,
  performAttack
} from './movementAndAttackManager';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.playerTeam = null;
    this.opponentTeam = null;
    this.positionedCharacters = [];
    this.currentLevel = 1;
    this.isGameOver = false;
    this.selectedCharacterIndex = undefined;
    this.gameState = new GameState();
  }

  createCharacterFromData({ level, attack, defence, health, type, moveRange, attackRange }) {
    const characterMap = {
      bowman: Bowman,
      swordsman: Swordsman,
      magician: Magician,
      vampire: Vampire,
      undead: Undead,
      daemon: Daemon
    };

    const CharacterClass = characterMap[type];
    if (!CharacterClass) {
      throw new Error(`Неизвестный тип персонажа: ${type}`);
    }
   
   return new CharacterClass(level, attack, defence, health, moveRange, attackRange);
  }

  loadGameState(loadedState) {
    try {
      
      if (!loadedState || typeof loadedState !== 'object') {
        throw new Error('Некорректное загруженное состояние игры');
      }

      this.gameState = GameState.from(loadedState);
      this.currentLevel = loadedState.currentLevel || 1;
      this.isGameOver = loadedState.isGameOver || false;
      this.playerTeam = new Team();
      this.opponentTeam = new Team();
      this.positionedCharacters = [];

      
      for (const { character: charData, position } of loadedState.positionedCharacters) {
       
        if (position < 0 || position >= this.gamePlay.boardSize ** 2) {
          throw new Error(`Некорректная позиция персонажа: ${position}`);
        }
        const character = this.createCharacterFromData(charData);
        this.positionedCharacters.push(new PositionedCharacter(character, position));

       
        if (['bowman', 'swordsman', 'magician'].includes(character.type)) {
          this.playerTeam.add(character);
        } else if (['vampire', 'undead', 'daemon'].includes(character.type)) {
          this.opponentTeam.add(character);
        }
      }

     
      const theme = this.getThemeForLevel(this.currentLevel);
      this.gamePlay.drawUi(theme);
      this.gamePlay.redrawPositions(this.positionedCharacters);

     
      if (this.selectedCharacterIndex !== undefined) {
        this.gamePlay.deselectCell(this.selectedCharacterIndex);
        this.selectedCharacterIndex = undefined;
      }
    } catch (error) {
      GamePlay.showError(`Ошибка при загрузке игры: ${error.message}`);
    }
  }

  saveGameState() {
    try {
      this.gameState.currentLevel = this.currentLevel;
      this.gameState.isGameOver = this.isGameOver;

      
      const charactersToSave = this.positionedCharacters.map(pc => ({
        type: pc.character.type,
        level: pc.character.level,
        attack: pc.character.attack,
        defence: pc.character.defence,
        health: pc.character.health,
        x: pc.character.x,
        y: pc.character.y,
        moveRange: pc.character.moveRange,
        attackRange: pc.character.attackRange
      }));

      this.gameState.playerTeam = charactersToSave.filter(c => ['bowman', 'swordsman', 'magician'].includes(c.type));
      this.gameState.opponentTeam = charactersToSave.filter(c => ['vampire', 'undead', 'daemon'].includes(c.type));
      this.gameState.positionedCharacters = this.positionedCharacters.map(pc => ({
        character: charactersToSave.find(c => c.type === pc.character.type && c.health === pc.character.health),
        position: pc.position
      }));

      this.stateService.save(this.gameState);
      GamePlay.showMessage('Игра успешно сохранена');
    } catch (error) {
      GamePlay.showError(`Ошибка при сохранении игры: ${error.message}`);
    }
  }

  init() {
    this.gamePlay.drawUi(themes.prairie.name);
    this.generateTeams();
    this.placeCharacters();
    this.gamePlay.redrawPositions(this.positionedCharacters);

    const listeners = {
      cellClick: index => this.onCellClick(index),
      cellEnter: index => this.onCellEnter(index),
      cellLeave: index => this.onCellLeave(index),
      newGame: () => this.startNewGame(),
      saveGame: () => this.saveGameState(),
      loadGame: loadedState => this.loadGameState(loadedState)
    };

    this.gamePlay.addCellClickListener(listeners.cellClick);
    this.gamePlay.addCellEnterListener(listeners.cellEnter);
    this.gamePlay.addCellLeaveListener(listeners.cellLeave);
    this.gamePlay.addNewGameListener(listeners.newGame);
    this.gamePlay.addSaveGameListener(listeners.saveGame);
    this.gamePlay.addLoadGameListener(listeners.loadGame);
  }

  generateTeams() {
    const playerTypes = [Bowman, Swordsman, Magician];
    const opponentTypes = [Vampire, Undead, Daemon];
    const maxLevel = this.currentLevel;
    const characterCount = 4;

    this.playerTeam = generateTeam(playerTypes, maxLevel, characterCount);
    this.opponentTeam = generateTeam(opponentTypes, maxLevel, characterCount);
  }

  placeCharacters() {
    this.positionedCharacters = [];

    const boardSize = this.gamePlay.boardSize;
    const playerPositions = [
      ...Array.from({ length: boardSize }, (_, i) => i * boardSize),
      ...Array.from({ length: boardSize }, (_, i) => i * boardSize + 1)
    ];
    const opponentPositions = [
      ...Array.from({ length: boardSize }, (_, i) => i * boardSize + boardSize - 2),
      ...Array.from({ length: boardSize }, (_, i) => i * boardSize + boardSize - 1)
    ];

    this.placeTeam(this.playerTeam, playerPositions);
    this.placeTeam(this.opponentTeam, opponentPositions);
  }

  placeTeam(team, availablePositions) {
    const usedPositions = new Set();
    for (const character of team.characters) {
      const available = availablePositions.filter(pos => !usedPositions.has(pos));
      if (!available.length) {
        throw new Error('Недостаточно свободных позиций для размещения всех персонажей');
      }
      const position = available[Math.floor(Math.random() * available.length)];
      usedPositions.add(position);
      this.positionedCharacters.push(new PositionedCharacter(character, position));
    }
  }

  onCellClick(index) {
    if (this.isGameOver || this.gameState.getCurrentPlayer() !== 'player') return;

    const cellCharacter = this.positionedCharacters.find(pc => pc.position === index);

    if (cellCharacter) {
      const isPlayerCharacter = this.isPlayer(cellCharacter.character);

      if (isPlayerCharacter) {
        if (this.selectedCharacterIndex !== undefined) {
          this.gamePlay.deselectCell(this.selectedCharacterIndex);
        }
        this.selectedCharacterIndex = index;
        this.gamePlay.selectCell(index);
      } else if (this.selectedCharacterIndex !== undefined) {
        const selectedCharacter = this.positionedCharacters.find(pc => pc.position === this.selectedCharacterIndex);
        const attackRange = this.getAttackRange(
          selectedCharacter.position,
          this.getAttackDistance(selectedCharacter.character.type)
        );

        if (attackRange.has(index)) {
          this.performAttack(selectedCharacter.character, cellCharacter.character, this.positionedCharacters)
            .then(updatedPositions => {
              this.positionedCharacters = updatedPositions;
              this.gamePlay.redrawPositions(this.positionedCharacters);

              if (cellCharacter.character.health <= 0) {
                this.gameState.addScore(100);
              }

              const levelAdvanced = this.checkGameEnd();

              this.gamePlay.deselectCell(this.selectedCharacterIndex);
              this.gamePlay.deselectCell(index);
              this.selectedCharacterIndex = undefined;

              if (!levelAdvanced) {
                this.gameState.togglePlayer();
                setTimeout(() => this.computerTurn(), 500);
              }
            });
        }
      } else {
        GamePlay.showError('Сначала выберите своего персонажа!');
      }
    } else if (this.selectedCharacterIndex !== undefined) {
      const selectedCharacter = this.positionedCharacters.find(pc => pc.position === this.selectedCharacterIndex);
      const moveRange = this.getMoveRange(
        selectedCharacter.position,
        this.getMoveDistance(selectedCharacter.character.type)
      );

      if (moveRange.includes(index) && !this.positionedCharacters.some(pc => pc.position === index)) {
        selectedCharacter.position = index;
        this.gamePlay.deselectCell(this.selectedCharacterIndex);
        this.gamePlay.deselectCell(index);
        this.selectedCharacterIndex = undefined;
        this.gamePlay.redrawPositions(this.positionedCharacters);

        this.gameState.togglePlayer();
        setTimeout(() => this.computerTurn(), 100);
      } else {
        GamePlay.showError('Недопустимый ход!');
      }
    } else {
      GamePlay.showError('Выберите персонажа!');
    }
  }

  onCellEnter(index) {
    if (this.isGameOver) return;

    const characterOnCell = this.positionedCharacters.find(pc => pc.position === index);
    if (!characterOnCell) {
      this.handleMoveCursor(index);
      return;
    }

    const { level, attack, defence, health } = characterOnCell.character;
    const message = formatCharacterInfo(level, attack, defence, health);
    this.gamePlay.showCellTooltip(message, index);

    if (this.isPlayer(characterOnCell.character)) {
      this.gamePlay.setCursor('pointer');
      return;
    }

    if (this.selectedCharacterIndex !== undefined) {
      const selectedCharacter = this.positionedCharacters.find(pc => pc.position === this.selectedCharacterIndex);
      const attackRange = this.getAttackRange(
        selectedCharacter.position,
        this.getAttackDistance(selectedCharacter.character.type)
      );

      if (attackRange.has(index)) {
        this.gamePlay.setCursor('crosshair');
        this.gamePlay.selectCell(index, 'red');
      } else {
        this.gamePlay.setCursor('not-allowed');
      }
    } else {
      this.gamePlay.setCursor('not-allowed');
    }
  }

  onCellLeave(index) {
    if (this.isGameOver) return;

    this.gamePlay.hideCellTooltip(index);
    if (index !== this.selectedCharacterIndex) {
      this.gamePlay.deselectCell(index);
    }
    this.gamePlay.setCursor('auto');
  }

  handleMoveCursor(index) {
    if (this.selectedCharacterIndex === undefined) {
      this.gamePlay.setCursor('not-allowed');
      return;
    }

    const selectedCharacter = this.positionedCharacters.find(pc => pc.position === this.selectedCharacterIndex);
    const moveRange = this.getMoveRange(
      selectedCharacter.position,
      this.getMoveDistance(selectedCharacter.character.type)
    );

    if (moveRange.includes(index) && !this.positionedCharacters.some(pc => pc.position === index)) {
      this.gamePlay.setCursor('pointer');
      this.gamePlay.selectCell(index, 'green');
    } else {
      this.gamePlay.setCursor('not-allowed');
    }
  }

  isPlayer(character) {
    return ['bowman', 'swordsman', 'magician'].includes(character.type);
  }

  getMoveRange(index, distance) {
    return getMoveRange(index, distance, this.gamePlay.boardSize);
  }

  getMoveDistance(type) {
    return getMoveDistance(type);
  }

  getAttackDistance(type) {
    return getAttackDistance(type);
  }

  getAttackRange(position, range) {
    return getAttackRange(position, range, this.gamePlay.boardSize);
  }

  async performAttack(attacker, target, positions) {
    return performAttack(attacker, target, positions, this.gamePlay);
  }

  computerTurn() {
    computerTurn(this);
  }

  calculateDistance(pos1, pos2) {
    const size = this.gamePlay.boardSize;
    const x1 = pos1 % size;
    const y1 = Math.floor(pos1 / size);
    const x2 = pos2 % size;
    const y2 = Math.floor(pos2 / size);
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
  }

  levelUpCharacter(character) {
    character.level += 1;
    character.health = Math.min(character.health + 80, 100);
    const life = character.health;
    character.attack = Math.max(character.attack, character.attack * (80 + life) / 100);
    character.defence = Math.max(character.defence, character.defence * (80 + life) / 100);
  }

  levelUp() {
    this.positionedCharacters
      .filter(pc => this.isPlayer(pc.character))
      .forEach(pc => this.levelUpCharacter(pc.character));
    this.gameState.addScore(500);
  }

  checkGameEnd() {
    const computerCharacters = this.positionedCharacters.filter(pc => !this.isPlayer(pc.character));
    const playerCharacters = this.positionedCharacters.filter(pc => this.isPlayer(pc.character));

    if (computerCharacters.length === 0 && playerCharacters.length > 0) {
      this.levelUp();
      this.startNewLevel();
      return true;
    } else if (playerCharacters.length === 0) {
      this.isGameOver = true;
      alert(`Игра окончена! Победа компьютера! Счет: ${this.gameState.score}, Максимальный счет: ${this.gameState.maxScore}`);
      return false;
    }
    return false;
  }

  startNewLevel() {
    this.currentLevel += 1;
    const themeMap = {
      2: themes.desert.name,
      3: themes.arctic.name,
      4: themes.mountain.name
    };

    const newTheme = themeMap[this.currentLevel] || themes.prairie.name;
    if (this.currentLevel > 4) {
      this.isGameOver = true;
      alert(`Поздравляем! Вы прошли игру! Счет: ${this.gameState.score}, Максимальный счет: ${this.gameState.maxScore}`);
      try {
        this.stateService.save(this.gameState);
      } catch (error) {
        console.warn('Ошибка сохранения состояния:', error);
      }
      return;
    }

    this.gamePlay.drawUi(newTheme);

    const survivingPlayerCharacters = this.positionedCharacters
      .filter(pc => this.isPlayer(pc.character))
      .map(pc => pc.character);

    const opponentTypes = [Vampire, Undead, Daemon];
    const maxLevel = this.currentLevel;
    const characterCount = 4;
    this.opponentTeam = generateTeam(opponentTypes, maxLevel, characterCount);

    this.playerTeam = new Team();
    survivingPlayerCharacters.forEach(character => this.playerTeam.add(character));
    this.placeCharacters();
    this.gamePlay.redrawPositions(this.positionedCharacters);
    this.gameState.currentPlayer = 'player';
    try {
      this.stateService.save(this.gameState);
    } catch (error) {
      console.warn('Ошибка сохранения состояния:', error);
    }
  }

  startNewGame() {
    this.isGameOver = false;
    this.currentLevel = 1;
    this.gameState.resetScore();
    this.gameState.currentPlayer = 'player';
    this.positionedCharacters = [];
    this.selectedCharacterIndex = undefined;
    this.gamePlay.drawUi(themes.prairie.name);
    this.generateTeams();
    this.placeCharacters();
    this.gamePlay.redrawPositions(this.positionedCharacters);
  }

  getThemeForLevel(level) {
    const themeMap = {
      1: themes.prairie.name,
      2: themes.desert.name,
      3: themes.arctic.name,
      4: themes.mountain.name
    };
    return themeMap[level] || themes.prairie.name;
  }
}
