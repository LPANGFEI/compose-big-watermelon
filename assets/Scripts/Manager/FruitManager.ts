import { Fruit } from "../Gameplay/Fruit";
import { GameConfig } from "../Config/GameConfig";
import { GameEvent, GameEvents } from "../Event/GameEvents";
import {
  _decorator,
  Component,
  EventTouch,
  instantiate,
  Node,
  Prefab,
  RigidBody2D,
  ERigidBody2DType,
  UITransform,
  Vec3,
} from "cc";

const { ccclass, property } = _decorator;

/**
 * 水果管理器（单例 Component）
 *
 * 职责：
 *   1. 触摸时生成待生成水果（跟随手指移动）
 *   2. 松手时释放水果（启用物理）
 *   3. 同步 GuideLine 引导线
 *   4. 处理水果合成（两个同等级 → 升级）
 *   5. 管理生成队列和冷却
 *
 * 挂在场景持久化节点上。
 */
@ccclass("FruitManager")
export class FruitManager extends Component {
  static instance: FruitManager;

  @property({ type: Prefab, tooltip: "水果预制体" })
  fruitPrefab: Prefab = null;

  @property({ type: Node, tooltip: "游戏区域容器节点（水果的父节点）" })
  gameArea: Node = null;

  @property({ type: Node, tooltip: "死亡线节点" })
  deathLineNode: Node = null;

  @property({ type: Node, tooltip: "引导线节点（GuideLine）" })
  guideLine: Node = null;

  /** 是否允许生成水果 */
  private canSpawn: boolean = true;

  /** 当前待生成的水果节点（触摸中未松手） */
  private pendingFruit: Node | null = null;

  /** 待生成水果的刚体组件 */
  private pendingRigidbody: RigidBody2D | null = null;

  protected onLoad(): void {
    FruitManager.instance = this;

    GameEvents.on(GameEvent.TOUCH_START, this.onTouchStart, this);
    GameEvents.on(GameEvent.TOUCH_MOVE, this.onTouchMove, this);
    GameEvents.on(GameEvent.TOUCH_END, this.onTouchEnd, this);
    GameEvents.on(GameEvent.FRUIT_MERGE, this.onFruitMerge, this);
    GameEvents.on(GameEvent.GAME_OVER, this.onGameOver, this);

    if (this.guideLine) {
      this.guideLine.active = false;
    }
  }

  protected onDestroy(): void {
    GameEvents.off(GameEvent.TOUCH_START, this.onTouchStart, this);
    GameEvents.off(GameEvent.TOUCH_MOVE, this.onTouchMove, this);
    GameEvents.off(GameEvent.TOUCH_END, this.onTouchEnd, this);
    GameEvents.off(GameEvent.FRUIT_MERGE, this.onFruitMerge, this);
    GameEvents.off(GameEvent.GAME_OVER, this.onGameOver, this);
    this.unschedule(this.onSpawnCooldownEnd);
    this.cleanupPendingFruit();
  }

  /** 触摸开始 → 创建待生成水果 & 显示引导线 */
  private onTouchStart(event: EventTouch): void {
    if (!this.canSpawn) return;
    if (this.pendingFruit) return;

    this.createPendingFruit(event);
  }

  /** 触摸移动 → 待生成水果 + 引导线跟随手指 X 轴 */
  private onTouchMove(event: EventTouch): void {
    if (!this.pendingFruit) return;

    const clampedX = this.clampTouchX(event);

    const fruitPos = this.pendingFruit.getPosition();
    this.pendingFruit.setPosition(new Vec3(clampedX, fruitPos.y, fruitPos.z));

    if (this.guideLine && this.guideLine.active) {
      const guidePos = this.guideLine.getPosition();
      this.guideLine.setPosition(new Vec3(clampedX, guidePos.y, guidePos.z));
    }
  }

  /** 触摸结束 → 释放水果（启用物理），隐藏引导线 */
  private onTouchEnd(): void {
    if (!this.pendingFruit) return;

    if (this.pendingRigidbody) {
      this.pendingRigidbody.type = ERigidBody2DType.Dynamic;
    }

    if (this.guideLine) {
      this.guideLine.active = false;
    }

    this.pendingFruit = null;
    this.pendingRigidbody = null;

    this.canSpawn = false;
    this.scheduleOnce(this.onSpawnCooldownEnd, GameConfig.SPAWN_INTERVAL);
  }

  /** 创建待生成水果（Kinematic、无物理下落） */
  private createPendingFruit(event: EventTouch): void {
    if (!this.fruitPrefab) return;

    const clampedX = this.clampTouchX(event);

    const spawnY = this.deathLineNode
      ? this.deathLineNode.position.y - GameConfig.SPAWN_POSITION_OFFSET
      : 300;

    const fruitNode = instantiate(this.fruitPrefab);
    fruitNode.parent = this.gameArea;
    fruitNode.setPosition(new Vec3(clampedX, spawnY, 0));

    // Kinematic 刚体不受重力影响，触摸时可手动控制位置
    const rb = fruitNode.getComponent(RigidBody2D);
    if (rb) {
      rb.type = ERigidBody2DType.Kinematic;
      this.pendingRigidbody = rb;
    }

    // 随机生成低级水果（0-3 级）
    const randomLevel = Math.floor(Math.random() * 4);
    const fruitComp = fruitNode.getComponent(Fruit);
    if (fruitComp) {
      fruitComp.level = randomLevel;
    }

    this.pendingFruit = fruitNode;

    if (this.guideLine) {
      this.guideLine.active = true;
      const guidePos = this.guideLine.getPosition();
      this.guideLine.setPosition(new Vec3(clampedX, guidePos.y, guidePos.z));
    }
  }

  /** 将触摸事件 X 限制在游戏区边界内 */
  private clampTouchX(event: EventTouch): number {
    const location = event.getLocation();
    const position = this.node
      .getComponent(UITransform)
      .convertToNodeSpaceAR(new Vec3(location.x, location.y, 0));

    return Math.max(
      GameConfig.GAME_AREA_BOUNDARY.minX,
      Math.min(GameConfig.GAME_AREA_BOUNDARY.maxX, position.x),
    );
  }

  /** 冷却结束 → 解锁生成 */
  private onSpawnCooldownEnd(): void {
    this.canSpawn = true;
  }

  /** 清理待生成水果 */
  private cleanupPendingFruit(): void {
    if (this.pendingFruit) {
      this.pendingFruit.destroy();
      this.pendingFruit = null;
      this.pendingRigidbody = null;
    }
    if (this.guideLine) {
      this.guideLine.active = false;
    }
  }

  /** 水果合成处理 */
  private onFruitMerge(fruitA: Fruit, fruitB: Fruit): void {
    const mergePosition = this.getMergePosition(fruitA, fruitB);

    // 延迟销毁旧水果，避免在 Box2D 接触回调中操作刚体
    this.scheduleOnce(() => {
      fruitB.node.destroy();
    }, 0);

    fruitA.upgradeLevel();
    fruitA.node.setPosition(mergePosition);
  }

  /** 计算合成后的位置（两个水果的中点） */
  private getMergePosition(fruitA: Fruit, fruitB: Fruit): Vec3 {
    const posA = fruitA.node.getPosition();
    const posB = fruitB.node.getPosition();
    return new Vec3((posA.x + posB.x) / 2, Math.max(posA.y, posB.y), 0);
  }

  /** 游戏结束 → 停止生成 */
  private onGameOver(): void {
    this.canSpawn = false;
    this.cleanupPendingFruit();
  }

  /** 重置状态（新一局开始时调用） */
  reset(): void {
    this.unschedule(this.onSpawnCooldownEnd);
    this.canSpawn = true;
    this.cleanupPendingFruit();
    const container = this.gameArea || this.node;
    const children = [...container.children];
    for (const child of children) {
      if (child.getComponent(Fruit)) {
        child.destroy();
      }
    }
  }
}
