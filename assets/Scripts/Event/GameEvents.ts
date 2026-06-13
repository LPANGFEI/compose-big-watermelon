import { EventTarget } from "cc";

/**
 * 全局事件系统 —— 各组件通过事件通信，不互相 import。
 *
 * 用法：
 *   GameEvents.on(GameEvent.START_GAME, callback, this);
 *   GameEvents.emit(GameEvent.START_GAME);
 *   GameEvents.off(GameEvent.START_GAME, callback, this);
 *
 * 别忘了在 onDisable 或 onDestroy 里 off，否则容易泄漏。
 */

/** 全局事件总线实例 */
export const GameEvents = new EventTarget();

/** 事件名枚举 —— 全大写、蛇形命名，一眼看出是事件 */
export enum GameEvent {
  /** 开始游戏（首页按钮 → GameManager） */
  START_GAME = "START_GAME",

  /** 重新开始一局（结算页 / 游戏页按钮 → GamePageView） */
  RESTART_GAME = "RESTART_GAME",

  /** 返回首页（结算页 / 游戏页按钮 → GameManager） */
  RETURN_HOME_PAGE = "RETURN_HOME_PAGE",

  /** 游戏结束（GamePageView 检测到无步可走 → GameManager） */
  GAME_OVER = "GAME_OVER",

  /** 分数更新（GamePageView 移动后 → 自身 UI 刷新） */
  SCORE_UPDATED = "SCORE_UPDATED",

  /** 撤回次数更新（DataManager → GamePageView 按钮文案刷新） */
  UPDATE_UNDO_COUNT = "UPDATE_UNDO_COUNT",

  /** 撤回后分数恢复（DataManager → GamePageView 仅刷新 UI，不加分） */
  UNDO_SCORE_RESTORED = "UNDO_SCORE_RESTORED",
}
