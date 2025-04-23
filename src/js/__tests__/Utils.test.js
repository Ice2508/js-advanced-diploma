import { calcTileType } from '../utils';

describe('calcTileType function', () => {
  test('should return "top-left" for index 0 in an 8x8 grid', () => {
    expect(calcTileType(0, 8)).toBe('top-left');
  });

  test('should return "top" for index 1 in an 8x8 grid', () => {
    expect(calcTileType(1, 8)).toBe('top');
  });

  test('should return "top-right" for index 7 in an 8x8 grid', () => {
    expect(calcTileType(7, 8)).toBe('top-right');
  });

  test('should return "left" for index 8 in an 8x8 grid', () => {
    expect(calcTileType(8, 8)).toBe('left');
  });

  test('should return "right" for index 15 in an 8x8 grid', () => {
    expect(calcTileType(15, 8)).toBe('right');
  });

  test('should return "bottom-left" for index 56 in an 8x8 grid', () => {
    expect(calcTileType(56, 8)).toBe('bottom-left');
  });

  test('should return "bottom" for index 62 in an 8x8 grid', () => {
    expect(calcTileType(62, 8)).toBe('bottom');
  });

  test('should return "bottom-right" for index 63 in an 8x8 grid', () => {
    expect(calcTileType(63, 8)).toBe('bottom-right');
  });

  test('should return "center" for index 24 in a 5x5 grid', () => {
    expect(calcTileType(12, 5)).toBe('center');
  });
});
