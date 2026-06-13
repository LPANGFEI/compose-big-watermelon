import { _decorator, Component, EventTouch } from "cc";
import { GameEvent, GameEvents } from "../Event/GameEvents";

const { ccclass } = _decorator;

/**
 * 触摸管理器（单例 Component）
 *
 * 职责：
 *   1. 收口所有触摸事件（由 Components/Touch.ts 发出）
 *   2. 统一控制触摸开关（暂停时禁用，继续时恢复）
 *   3. 向 GameManager / FruitManager 转发触摸数据
 *
 * 挂在场景持久化节点上，跨场景存活。
 */
@ccclass("TouchManager")
export class TouchManager extends Component {
  static instance: TouchManager;

  /** 触摸是否启用 */
  private touchEnabled: boolean = true;

  protected onLoad(): void {
    TouchManager.instance = this;
  }

  protected start(): void {
    // 监听来自 Touch 组件的内部触摸事件（带 RAW_ 前缀，防循环）
    GameEvents.on(GameEvent.RAW_TOUCH_START, this.onTouchStart, this);
    GameEvents.on(GameEvent.RAW_TOUCH_MOVE,  this.onTouchMove,  this);
    GameEvents.on(GameEvent.RAW_TOUCH_END,   this.onTouchEnd,   this);
  }

  /** 启用触摸 */
  enableTouch(): void {
    this.touchEnabled = true;
  }

  /** 禁用触摸 */
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

  protected onDestroy(): void {
    GameEvents.off(GameEvent.RAW_TOUCH_START, this.onTouchStart, this);
    GameEvents.off(GameEvent.RAW_TOUCH_MOVE,  this.onTouchMove,  this);
    GameEvents.off(GameEvent.RAW_TOUCH_END,   this.onTouchEnd,   this);
  }
}