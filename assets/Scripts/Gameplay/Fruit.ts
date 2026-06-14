import {
  _decorator,
  Collider2D,
  Component,
  Contact2DType,
  IPhysics2DContact,
} from "cc";
import { GameConfig } from "../Config/GameConfig";
import { GameEvent, GameEvents } from "../Event/GameEvents";

const { ccclass, property } = _decorator;

/**
 * 水果实体组件
 * 挂在 Fruit 预制体上，负责水果的等级、碰撞检测、合成触发。
 */
@ccclass("Fruit")
export class Fruit extends Component {
  /** 水果等级（0=樱桃, 9=西瓜） */
  @property({ tooltip: "水果等级（0-9）" })
  level: number = 0;

  /** 是否已落地（落地后不再响应拖拽） */
  private hasLanded: boolean = false;

  /** 是否正在合成中（防止重复合成） */
  private isMerging: boolean = false;

  protected onLoad(): void {
    this.registerCollision();
  }

  /** 注册碰撞回调 */
  private registerCollision(): void {
    const collider = this.getComponent(Collider2D);
    if (!collider) return;

    collider.on(Contact2DType.BEGIN_CONTACT, this.onCollisionEnter, this);
  }

  /** 碰撞进入回调 —— 检测到同等级水果则触发合成 */
  private onCollisionEnter(
    selfCollider: Collider2D,
    otherCollider: Collider2D,
    contact: IPhysics2DContact | null,
  ): void {
    if (this.isMerging) return;

    const otherFruit = otherCollider.node.getComponent(Fruit);
    if (!otherFruit) return;
    if (otherFruit.isMerging) return;

    // 同等级且未满级才能合成
    if (this.level === otherFruit.level && this.level < GameConfig.MAX_LEVEL) {
      this.isMerging = true;
      otherFruit.isMerging = true;

      GameEvents.emit(GameEvent.FRUIT_MERGE, this, otherFruit);
    }
  }

  /** 标记水果已落地 */
  markAsLanded(): void {
    this.hasLanded = true;
    GameEvents.emit(GameEvent.FRUIT_DROP, this);
  }

  /** 获取当前等级对应的配置 */
  getFruitConfig(): (typeof GameConfig.FRUIT_TYPES)[number] {
    return GameConfig.FRUIT_TYPES[this.level];
  }

  /** 升级到下一等级水果 */
  upgradeLevel(): void {
    if (this.level < GameConfig.MAX_LEVEL) {
      this.level++;
    }
  }

  /** 是否已落地 */
  get hasLandedFruit(): boolean {
    return this.hasLanded;
  }

  protected onDestroy(): void {
    const collider = this.getComponent(Collider2D);
    if (collider) {
      collider.off(Contact2DType.BEGIN_CONTACT, this.onCollisionEnter, this);
    }
  }
}
