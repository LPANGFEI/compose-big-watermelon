import { _decorator, Component, EventTouch } from "cc";
import { GameEvent, GameEvents } from "../Event/GameEvents";

const { ccclass } = _decorator;

/**
 * 通用触摸输入组件
 * 挂在需要接收触摸事件的节点上，将原生触摸事件转为内部事件发出。
 *
 * 使用 RAW_TOUCH_* 前缀，经 TouchManager 过滤后再广播标准 TOUCH_* 事件。
 * 不依赖任何 Manager，只做事件转发。
 */
@ccclass("Touch")
export class Touch extends Component {
  /** 触摸开始 → 发送内部事件给 TouchManager */
  onTouchStart(event: EventTouch): void {
    GameEvents.emit(GameEvent.RAW_TOUCH_START, event);
  }

  /** 触摸移动 */
  onTouchMove(event: EventTouch): void {
    GameEvents.emit(GameEvent.RAW_TOUCH_MOVE, event);
  }

  /** 触摸结束 */
  onTouchEnd(event: EventTouch): void {
    GameEvents.emit(GameEvent.RAW_TOUCH_END, event);
  }
}