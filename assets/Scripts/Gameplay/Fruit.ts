import { GameConfig } from "../Config/GameConfig";
import { GameEvent, GameEvents } from "../Event/GameEvents";
import {
  _decorator,
  CircleCollider2D,
  Collider2D,
  Component,
  Contact2DType,
  IPhysics2DContact,
  Sprite,
  SpriteAtlas,
  UITransform,
} from "cc";

const { ccclass, property } = _decorator;

@ccclass("Fruit")
export class Fruit extends Component {
  @property({ tooltip: "水果等级（0=樱桃, 9=西瓜）" })
  level: number = 0;

  @property({
    type: Sprite,
    tooltip: "水果 Sprite 组件（自动 fallback 到自身）",
  })
  fruitSprite: Sprite = null;

  @property({ type: SpriteAtlas, tooltip: "水果精灵图集（需手动绑定）" })
  fruitAtlas: SpriteAtlas = null;

  private isMerging: boolean = false;

  protected onLoad(): void {
    this.registerCollision();

    if (!this.fruitSprite) {
      this.fruitSprite = this.getComponent(Sprite);
    }
    this.syncLevel();
  }

  /**
   * 按碰撞体 → 视觉的顺序同步，因为碰撞体更新更快，
   * 且 Box2D fixture 可能因 parent 变化重建。
   */
  public syncLevel(): void {
    this.syncCollider();
    this.syncSprite();
  }

  /** 同步水果 Sprite 图片 */
  public syncSprite(): void {
    if (this.fruitSprite && this.fruitAtlas) {
      const frame = this.fruitAtlas.getSpriteFrame(this.level.toString());
      if (frame) {
        this.fruitSprite.spriteFrame = frame;

        const uiTransform = this.getComponent(UITransform);
        if (uiTransform) {
          uiTransform.setContentSize(frame.originalSize);
        }
      }
    } else if (!this.fruitAtlas) {
      console.warn(
        "[Fruit] fruitAtlas 未绑定，请在 Fruit.prefab 中选择水果精灵图集",
      );
    }
  }

  /** 同步水果碰撞体半径 */
  public syncCollider(): void {
    const config = GameConfig.FRUIT_TYPES[this.level];
    if (!config) return;

    const collider = this.getComponent(CircleCollider2D);
    if (collider) {
      collider.radius = config.radius;
    }
  }

  /** 注册水果碰撞事件 */
  private registerCollision(): void {
    const collider = this.getComponent(Collider2D);
    if (!collider) return;

    collider.on(Contact2DType.BEGIN_CONTACT, this.onCollisionEnter, this);
  }

  /**
   * 检测到同等级水果（未满级）时触发合成。
   * isMerging 双端保护防止在事件中重复 emit。
   */
  private onCollisionEnter(
    selfCollider: Collider2D,
    otherCollider: Collider2D,
    contact: IPhysics2DContact | null,
  ): void {
    if (this.isMerging) return;

    const otherFruit = otherCollider.node.getComponent(Fruit);
    if (!otherFruit) return;
    if (otherFruit.isMerging) return;

    if (this.level === otherFruit.level && this.level < GameConfig.MAX_LEVEL) {
      this.isMerging = true;
      otherFruit.isMerging = true;

      GameEvents.emit(GameEvent.FRUIT_MERGE, this, otherFruit);
    }
  }

  /** 获取水果配置 */
  getFruitConfig(): (typeof GameConfig.FRUIT_TYPES)[number] {
    return GameConfig.FRUIT_TYPES[this.level];
  }

  /** 升级后重置 isMerging，允许链式合成 */
  upgradeLevel(): void {
    if (this.level < GameConfig.MAX_LEVEL) {
      this.level++;
    }
    this.isMerging = false;
    this.syncLevel();
  }

  protected onDestroy(): void {
    const collider = this.getComponent(Collider2D);
    if (collider) {
      collider.off(Contact2DType.BEGIN_CONTACT, this.onCollisionEnter, this);
    }
  }
}
