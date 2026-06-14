import { EventTarget } from "cc";

/**
 * 全局事件总线
 * 各模块通过事件通信，避免循环依赖。
 *
 * 数据流：
 *   TouchManager → TOUCH_* → FruitManager
 *   Fruit.ts → FRUIT_MERGE → FruitManager + ScoreManager
 *   DeathLine → GAME_OVER → GameManager + GamePage
 *
 * 用法：
 *   GameEvents.on(GameEvent.XXX, callback, this);
 *   GameEvents.emit(GameEvent.XXX, ...args);
 *   GameEvents.off(GameEvent.XXX, callback, this);
 *
 * 务必在 onDisable / onDestroy 中 off，防止内存泄漏。
 */
export const GameEvents = new EventTarget();

/** 事件名枚举 —— 全大写蛇形命名 */
export enum GameEvent {
  // ========== 游戏生命周期 ==========

  /** 开始游戏 */
  START_GAME = "START_GAME",

  /** 重新开始 */
  RESTART_GAME = "RESTART_GAME",

  /** 返回首页 */
  RETURN_HOME = "RETURN_HOME",

  /** 游戏结束 */
  GAME_OVER = "GAME_OVER",

  // ========== 触摸事件 ==========

  /** 触摸开始（TouchManager 捕获后广播，业务层监听此事件） */
  TOUCH_START = "TOUCH_START",

  /** 触摸移动 */
  TOUCH_MOVE = "TOUCH_MOVE",

  /** 触摸结束 */
  TOUCH_END = "TOUCH_END",

  // ========== 水果逻辑 ==========

  /** 两个同等级水果合成 */
  FRUIT_MERGE = "FRUIT_MERGE",

  // ========== 分数 ==========

  /** 分数更新 */
  SCORE_UPDATED = "SCORE_UPDATED",

  // ========== 预览 ==========

  /** 下一个水果等级更新 */
  NEXT_FRUIT_LEVEL = "NEXT_FRUIT_LEVEL",
}
