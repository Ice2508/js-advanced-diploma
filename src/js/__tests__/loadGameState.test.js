import GameController from '../GameController';
import GamePlay from '../GamePlay';
import GameState from '../GameState';
import Bowman from '../characters/Bowman';
import Vampire from '../characters/Vampire';

describe('GameController - Load Game State Tests', () => {
  let gameController;
  let gamePlay;
  let stateService;

  beforeEach(() => {
    gamePlay = {
      boardSize: 8,
      drawUi: jest.fn(),
      redrawPositions: jest.fn(),
      deselectCell: jest.fn(),
      showError: jest.fn(),
    };

    stateService = {
      load: jest.fn(),
      save: jest.fn(),
    };

    jest.spyOn(GamePlay, 'showError').mockImplementation(jest.fn());

    gameController = new GameController(gamePlay, stateService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  test('should successfully load valid game state', () => {
    const loadedState = {
      currentLevel: 2,
      isGameOver: false,
      positionedCharacters: [
        {
          character: {
            type: 'bowman',
            level: 1,
            attack: 25,
            defence: 25,
            health: 100,
            moveRange: 2,
            attackRange: 2,
          },
          position: 0,
        },
        {
          character: {
            type: 'vampire',
            level: 1,
            attack: 25,
            defence: 25,
            health: 100,
            moveRange: 2,
            attackRange: 2,
          },
          position: 62,
        },
      ],
      currentPlayer: 'player',
    };

    gameController.selectedCharacterIndex = 0;

    gameController.loadGameState(loadedState);

    expect(gameController.currentLevel).toBe(2);
    expect(gameController.isGameOver).toBe(false);
    expect(gameController.gameState).toBeInstanceOf(GameState);
    expect(gameController.positionedCharacters).toHaveLength(2);
    expect(gameController.positionedCharacters[0].character).toBeInstanceOf(Bowman);
    expect(gameController.positionedCharacters[1].character).toBeInstanceOf(Vampire);
    expect(gameController.playerTeam.characters).toHaveLength(1);
    expect(gameController.opponentTeam.characters).toHaveLength(1);

    expect(gamePlay.drawUi).toHaveBeenCalledWith('desert');
    expect(gamePlay.redrawPositions).toHaveBeenCalledWith(gameController.positionedCharacters);
    expect(gamePlay.deselectCell).toHaveBeenCalledWith(0);
    expect(GamePlay.showError).not.toHaveBeenCalled();
  });

  test('should handle invalid game state and show error', () => {
    const invalidStates = [
      null,
      {
        currentLevel: 1,
        isGameOver: false,
        positionedCharacters: [
          {
            character: {
              type: 'unknown',
              level: 1,
              attack: 25,
              defence: 25,
              health: 100,
              moveRange: 2,
              attackRange: 2,
            },
            position: 0,
          },
        ],
      },
      {
        currentLevel: 1,
        isGameOver: false,
        positionedCharacters: [
          {
            character: {
              type: 'bowman',
              level: 1,
              attack: 25,
              defence: 25,
              health: 100,
              moveRange: 2,
              attackRange: 2,
            },
            position: -1,
          },
        ],
      },
    ];

    invalidStates.forEach(state => {
      gameController.loadGameState(state);

      expect(GamePlay.showError).toHaveBeenCalledWith(
        expect.stringMatching(/Ошибка при загрузке игры:/)
      );

      expect(gameController.currentLevel).toBe(1);
      expect(gameController.positionedCharacters).toHaveLength(0);
      expect(gamePlay.drawUi).not.toHaveBeenCalled();
      expect(gamePlay.redrawPositions).not.toHaveBeenCalled();
    });
  });

  test('should integrate with stateService.load', () => {
    const loadedState = {
      currentLevel: 1,
      isGameOver: false,
      positionedCharacters: [
        {
          character: {
            type: 'bowman',
            level: 1,
            attack: 25,
            defence: 25,
            health: 100,
            moveRange: 2,
            attackRange: 2,
          },
          position: 0,
        },
      ],
    };

    stateService.load.mockReturnValue(loadedState);

    gameController.loadGameState(stateService.load());

    expect(stateService.load).toHaveBeenCalled();
    expect(gameController.currentLevel).toBe(1);
    expect(gameController.positionedCharacters).toHaveLength(1);
    expect(gamePlay.drawUi).toHaveBeenCalledWith('prairie');
    expect(gamePlay.redrawPositions).toHaveBeenCalled();
    expect(GamePlay.showError).not.toHaveBeenCalled();
  });
});
