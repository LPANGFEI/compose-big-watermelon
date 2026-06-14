import { GameEvent, GameEvents } from "../Event/GameEvents";
import {
  _decorator,
  Collider2D,
  Component,
  Contact2DType,
  IPhysics2DContact,
} from "cc";

const { ccclass } = _decorator;

/**
 * 死亡线组件
 * 挂在顶部边界碰撞体上，检测水果是否超出游戏区域上限。
 * 一旦触发，发送 GAME_OVER 事件。
 */
@ccclass("DeathLine")
export class DeathLine extends Component {
  private isGameOver: boolean = false;

  protected onLoad(): void {
    this.registerCollision();
  }

  /** 注册死亡线碰撞事件 */
  private registerCollision(): void {
    const collider = this.getComponent(Collider2D);
    if (!collider) return;

    collider.on(Contact2DType.BEGIN_CONTACT, this.onContact, this);
  }

  /** 死亡线碰撞事件处理 */
  private onContact(
    selfCollider: Collider2D,
    otherCollider: Collider2D,
    contact: IPhysics2DContact | null,
  ): void {
    if (this.isGameOver) return;
    this.isGameOver = true;
    GameEvents.emit(GameEvent.GAME_OVER);
  }

  protected onDestroy(): void {
    const collider = this.getComponent(Collider2D);
    if (collider) {
      collider.off(Contact2DType.BEGIN_CONTACT, this.onContact, this);
    }
  }
}
