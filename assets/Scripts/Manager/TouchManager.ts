import { _decorator, Component, EventTouch, Node } from "cc";
import { GameEvent, GameEvents } from "../Event/GameEvents";

const { ccclass } = _decorator;

/**
 * 触摸管理器（单例 Component）
 *
 * 职责：
 *   1. 直接捕获 Canvas 上的原生触摸事件
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
    // 节点已有 720×1280 的 UITransform，直接捕获自身触摸即可覆盖全屏
    this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
    this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
  }

  protected onDestroy(): void {
    this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
    this.node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
  }

  /** 启用触摸 */
  enableTouch(): void {
    this.touchEnabled = true;
  }

  /** 禁用触摸 */
  disableTouch(): void {
    this.touchEnabled = false;
  }

  /** 原始触摸开始 —— 过滤后广播给业务层 */
  private onTouchStart(event: EventTouch): void {
    if (!this.touchEnabled) return;
    GameEvents.emit(GameEvent.TOUCH_START, event);
  }

  /** 原始触摸移动 */
  private onTouchMove(event: EventTouch): void {
    if (!this.touchEnabled) return;
    GameEvents.emit(GameEvent.TOUCH_MOVE, event);
  }

  /** 原始触摸结束 */
  private onTouchEnd(event: EventTouch): void {
    if (!this.touchEnabled) return;
    GameEvents.emit(GameEvent.TOUCH_END, event);
  }
}
