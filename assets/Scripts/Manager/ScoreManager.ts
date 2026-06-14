import { _decorator, sys } from "cc";
import { GameConfig } from "../Config/GameConfig";
import { GameEvent, GameEvents } from "../Event/GameEvents";

/**
 * 分数管理器。
 *
 * 纯 TS 单例，在 Boot.onLoad() 中初始化。
 * 管理当前分数和历史最高分，持久化到 localStorage。
 * 分数增加由 FruitManager（在合成时）直接调用，不监听事件。
 */
export class ScoreManager {
  static instance = new ScoreManager();
  private constructor() {}

  /** 当前分数 */
  private currentScore: number = 0;

  /** 历史最高分 */
  private bestScore: number = 0;

  private initialized = false;

  /** 初始化：加载最高分，监听合成事件（幂等） */
  init(): void {
    if (this.initialized) return;
    this.initialized = true;

    this.loadBestScore();
    GameEvents.emit(GameEvent.SCORE_UPDATED, this.currentScore, this.bestScore);
  }

  /** 移除事件监听 */
  dispose(): void {
    this.initialized = false;
  }

  /** 从 localStorage 加载最高分 */
  private loadBestScore(): void {
    const saved = sys.localStorage.getItem(GameConfig.BEST_SCORE_KEY);
    this.bestScore = saved ? parseInt(saved) : 0;
  }

  /** 保存最高分到 localStorage */
  private saveBestScore(): void {
    sys.localStorage.setItem(
      GameConfig.BEST_SCORE_KEY,
      this.bestScore.toString(),
    );
  }

  /** 加分并检查最高分 */
  addScore(points: number): void {
    this.currentScore += points;

    if (this.currentScore > this.bestScore) {
      this.bestScore = this.currentScore;
      this.saveBestScore();
    }

    GameEvents.emit(GameEvent.SCORE_UPDATED, this.currentScore, this.bestScore);
  }

  /** 重置当前分数（新一局开始时调用） */
  resetScore(): void {
    this.currentScore = 0;
    GameEvents.emit(GameEvent.SCORE_UPDATED, this.currentScore, this.bestScore);
  }

  /** 获取当前分数 */
  getCurrentScore(): number {
    return this.currentScore;
  }

  /** 获取最高分 */
  getBestScore(): number {
    return this.bestScore;
  }
}
