import { Fruit } from "../Gameplay/Fruit";
import { GameConfig } from "../Config/GameConfig";
import { GameEvent, GameEvents } from "../Event/GameEvents";
import { sys } from "cc";

/**
 * 分数管理器（纯 TS 单例）
 *
 * 职责：
 *   1. 管理当前游戏分数
 *   2. 读写最高分到 localStorage
 *   3. 通过事件通知 UI 更新
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
    GameEvents.on(GameEvent.FRUIT_MERGE, this.onFruitMerge, this);
    GameEvents.emit(GameEvent.SCORE_UPDATED, this.currentScore, this.bestScore);
  }

  /** 移除事件监听 */
  dispose(): void {
    GameEvents.off(GameEvent.FRUIT_MERGE, this.onFruitMerge, this);
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

  /** 水果合成时加分 —— 按新等级对应的分数加分 */
  private onFruitMerge(fruitA: Fruit, _fruitB: Fruit): void {
    // fruitA.level 已被 FruitManager.onFruitMerge 中 upgradeLevel() 升级为新等级
    const newLevel = fruitA.level;
    if (newLevel <= GameConfig.MAX_LEVEL) {
      const config = GameConfig.FRUIT_TYPES[newLevel];
      this.addScore(config.score);
    }
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
