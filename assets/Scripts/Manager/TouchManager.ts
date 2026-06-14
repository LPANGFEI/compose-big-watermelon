import { input, Input, EventTouch } from "cc";
import { GameEvent, GameEvents } from "../Event/GameEvents";

/**
 * 触摸管理器（纯 TS 单例）
 *
 * 职责：
 *   1. 捕获全局触摸事件
 *   2. 统一控制触摸开关（暂停时禁用，继续时恢复）
 *   3. 向 FruitManager 转发触摸数据
 */
export class TouchManager {
  static instance = new TouchManager();
  private constructor() {}

  /** 触摸是否启用 */
  private touchEnabled: boolean = true;

  /** 是否已初始化 */
  private initialized = false;

  /** 初始化：注册全局触摸监听（幂等） */
  init(): void {
    if (this.initialized) return;
    this.initialized = true;

    input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
    input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
    input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
  }

  /** 移除事件监听 */
  dispose(): void {
    input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
    input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
    input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);

    this.initialized = false;
  }

  /** @internal 暂停功能预留 */
  enableTouch(): void {
    this.touchEnabled = true;
  }

  /** @internal 暂停功能预留 */
  disableTouch(): void {
    this.touchEnabled = false;
  }

  /** 触摸开始 —— 过滤后广播给业务层 */
  private onTouchStart(event: EventTouch): void {
    if (!this.touchEnabled) return;
    GameEvents.emit(GameEvent.TOUCH_START, event);
  }

  /** 触摸移动 */
  private onTouchMove(event: EventTouch): void {
    if (!this.touchEnabled) return;
    GameEvents.emit(GameEvent.TOUCH_MOVE, event);
  }

  /** 触摸结束 */
  private onTouchEnd(event: EventTouch): void {
    if (!this.touchEnabled) return;
    GameEvents.emit(GameEvent.TOUCH_END, event);
  }
}
