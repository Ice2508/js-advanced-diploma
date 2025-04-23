import GameController from '../GameController';

describe('GameController - Movement Tests', () => {
  let gameController;
  let gamePlay;
  let stateService;

  beforeEach(() => {
    gamePlay = {
      boardSize: 8,
      cells: Array(64).fill(null),
      drawUi: jest.fn(),
      redrawPositions: jest.fn(),
      selectCell: jest.fn(),
      deselectCell: jest.fn(),
      setCursor: jest.fn(),
      showCellTooltip: jest.fn(),
      hideCellTooltip: jest.fn(),
      addCellClickListener: jest.fn(),
      addCellEnterListener: jest.fn(),
      addCellLeaveListener: jest.fn(),
      showError: jest.fn(),
      addNewGameListener: jest.fn(),
      addSaveGameListener: jest.fn(),
      addLoadGameListener: jest.fn(),
    };

    stateService = {
      load: jest.fn(() => ({})),
      save: jest.fn(),
    };

    gameController = new GameController(gamePlay, stateService);
    gameController.init(); 
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should highlight correct cells for Bowman with movement range 2', () => {
    const bowmanPosition = gameController.positionedCharacters.find(
      (pc) => pc.character.type === 'bowman'
    )?.position;

    if (bowmanPosition === undefined) {
      console.warn('Bowman not found in team, skipping test');
      return;
    }

    const moveRange = gameController.getMoveRange(bowmanPosition, 2);

    expect(moveRange.length).toBeGreaterThanOrEqual(8);

    if (bowmanPosition % 8 >= 2) {
      expect(moveRange).toContain(bowmanPosition - 2); 
    }
    if (bowmanPosition % 8 <= 5) {
      expect(moveRange).toContain(bowmanPosition + 2); 
    }
  });

  test('should highlight correct cells for Magician with movement range 1', () => {
    const magicianPosition = gameController.positionedCharacters.find(
      (pc) => pc.character.type === 'magician'
    )?.position;

    if (magicianPosition === undefined) {
      console.warn('Magician not found in team, skipping test');
      return;
    }

    const moveRange = gameController.getMoveRange(magicianPosition, 1);

    expect(moveRange.length).toBeGreaterThan(0);

    if (magicianPosition % 8 < 7) {
      expect(moveRange).toContain(magicianPosition + 1); 
    }
    if (magicianPosition % 8 > 0) {
      expect(moveRange).toContain(magicianPosition - 1); 
    }
    if (magicianPosition + 8 < 64) {
      expect(moveRange).toContain(magicianPosition + 8); 
    }
    if (magicianPosition - 8 >= 0) {
      expect(moveRange).toContain(magicianPosition - 8); 
    }
  });

  test('should not highlight cells outside of the board for any character', () => {
    const magicianPosition = gameController.positionedCharacters.find(
      (pc) => pc.character.type === 'magician'
    )?.position;

    if (magicianPosition === undefined) {
      console.warn('Magician not found in team, skipping test');
      return;
    }

    const moveRange = gameController.getMoveRange(magicianPosition, 1);
    const size = gamePlay.boardSize;

    moveRange.forEach((cell) => {
      const row = Math.floor(cell / size);
      const col = cell % size;
      expect(row).toBeGreaterThanOrEqual(0);
      expect(col).toBeGreaterThanOrEqual(0);
      expect(row).toBeLessThan(size);
      expect(col).toBeLessThan(size);
    });
  });
});
