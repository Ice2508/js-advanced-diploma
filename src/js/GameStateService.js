export default class GameStateService {
  constructor(storage) {
    this.storage = storage;
  }

  save(state) {
    try {
      this.storage.setItem('gameState', JSON.stringify(state));
    } catch {
      throw new Error('Ошибка при сохранении игры');
    }
  }

  load() {
    try {
      const state = this.storage.getItem('gameState');
      if (!state) {
        throw new Error('Ошибка при загрузке игры');
      }
      return JSON.parse(state);
    } catch (e) {
      throw new Error('Ошибка при загрузке игры: ' + e.message);
    }
  }
}
