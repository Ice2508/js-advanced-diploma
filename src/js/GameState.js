export default class GameState {
  constructor() {
    this.currentPlayer = 'player';
    this.currentLevel = 1;
    this.score = 0;
    this.maxScore = 0;
    this.playerTeam = [];
    this.opponentTeam = [];
    this.positionedCharacters = [];
    this.selectedCharacterIndex = null;
    this.isGameOver = false;
    this.theme = 'prairie';
  }

  togglePlayer() {
    this.currentPlayer = this.currentPlayer === 'player' ? 'computer' : 'player';
  }

  getCurrentPlayer() {
    return this.currentPlayer;
  }

  addScore(points) {
    this.score += points;
    this.maxScore = Math.max(this.maxScore, this.score);
  }

  resetScore() {
    this.score = 0;
  }

  static from(object) {
    const state = new GameState();
    state.currentPlayer = object.currentPlayer || 'player';
    state.currentLevel = object.currentLevel || 1;
    state.score = object.score || 0;
    state.maxScore = object.maxScore || 0;
    state.playerTeam = object.playerTeam || [];
    state.opponentTeam = object.opponentTeam || [];
    state.positionedCharacters = object.positionedCharacters || [];
    state.selectedCharacterIndex = object.selectedCharacterIndex ?? null;
    state.isGameOver = object.isGameOver || false;
    state.theme = object.theme || 'prairie';
    return state;
  }
}
