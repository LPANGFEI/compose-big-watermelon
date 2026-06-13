import { EventTarget } from "cc";

/**
 * 全局事件总线
 * 各模块通过事件通信，避免循环依赖。
 *
 * 数据流：
 *   Components/Touch.ts → RAW_TOUCH_* → TouchManager → TOUCH_* → FruitManager
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

  /** 原始触摸开始（Touch.ts → TouchManager，内部使用，外部勿监听） */
  RAW_TOUCH_START = "RAW_TOUCH_START",

  /** 原始触摸移动（内部使用） */
  RAW_TOUCH_MOVE = "RAW_TOUCH_MOVE",

  /** 原始触摸结束（内部使用） */
  RAW_TOUCH_END = "RAW_TOUCH_END",

  /** 触摸开始（TouchManager 过滤后广播，业务层监听此事件） */
  TOUCH_START = "TOUCH_START",

  /** 触摸移动（TouchManager 过滤后广播） */
  TOUCH_MOVE = "TOUCH_MOVE",

  /** 触摸结束（TouchManager 过滤后广播） */
  TOUCH_END = "TOUCH_END",

  // ========== 水果逻辑 ==========

  /** 水果落到地面 */
  FRUIT_DROP = "FRUIT_DROP",

  /** 两个同等级水果合成 */
  FRUIT_MERGE = "FRUIT_MERGE",

  // ========== 分数 ==========

  /** 分数更新 */
  SCORE_UPDATED = "SCORE_UPDATED",
}