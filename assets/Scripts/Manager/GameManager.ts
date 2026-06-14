import { director } from "cc";
import { GameConfig } from "../Config/GameConfig";
import { GameEvent, GameEvents } from "../Event/GameEvents";

/**
 * 游戏生命周期管理器（纯 TS 单例）
 *
 * 职责：
 *   1. 控制游戏整体流程：开始 / 结束 / 重启 / 返回首页
 *   2. 通过 GameEvents 协调各模块状态
 */
export class GameManager {
  static instance = new GameManager();
  private constructor() {}

  private isPlaying: boolean = false;
  private initialized = false;

  get isGamePlaying(): boolean {
    return this.isPlaying;
  }

  /** 注册事件监听（幂等，多次调用安全） */
  init(): void {
    if (this.initialized) return;
    this.initialized = true;

    GameEvents.on(GameEvent.START_GAME, this.onStartGame, this);
    GameEvents.on(GameEvent.RESTART_GAME, this.onStartGame, this);
    GameEvents.on(GameEvent.RETURN_HOME, this.onReturnHome, this);
    GameEvents.on(GameEvent.GAME_OVER, this.onGameOver, this);
  }

  dispose(): void {
    GameEvents.off(GameEvent.START_GAME, this.onStartGame, this);
    GameEvents.off(GameEvent.RESTART_GAME, this.onStartGame, this);
    GameEvents.off(GameEvent.RETURN_HOME, this.onReturnHome, this);
    GameEvents.off(GameEvent.GAME_OVER, this.onGameOver, this);
    this.initialized = false;
  }

  private onStartGame(): void {
    this.isPlaying = true;
    director.loadScene(GameConfig.SCENE_NAME.GAME_SCENE);
  }

  private onGameOver(): void {
    this.isPlaying = false;
  }

  private onReturnHome(): void {
    this.isPlaying = false;
    director.loadScene(GameConfig.SCENE_NAME.HOME_SCENE);
  }
}
