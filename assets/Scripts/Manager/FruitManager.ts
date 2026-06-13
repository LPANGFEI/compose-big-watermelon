import { _decorator, Component, EventTouch, instantiate, Node, Prefab, UITransform, Vec3 } from "cc";
import { GameEvent, GameEvents } from "../Event/GameEvents";
import { Fruit } from "../Gameplay/Fruit";
import { GameConfig } from "../Config/GameConfig";

const { ccclass, property } = _decorator;

/**
 * 水果管理器（单例 Component）
 *
 * 职责：
 *   1. 生成水果（触摸松手时在对应位置创建）
 *   2. 处理水果合成（两个同等级 → 升级）
 *   3. 管理生成队列和冷却
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

  /** 是否允许生成水果 */
  private canSpawn: boolean = true;

  protected onLoad(): void {
    FruitManager.instance = this;
  }

  protected start(): void {
    // 监听触摸松手 → 生成水果
    GameEvents.on(GameEvent.TOUCH_END, this.onTouchEnd, this);
    // 监听水果合成
    GameEvents.on(GameEvent.FRUIT_MERGE, this.onFruitMerge, this);
    // 游戏结束时停止生成
    GameEvents.on(GameEvent.GAME_OVER, this.onGameOver, this);
  }

  /** 触摸松手 → 在该位置生成水果 */
  private onTouchEnd(event: EventTouch): void {
    if (!this.canSpawn) return;

    const position = this.getNodePosition(event);
    this.spawnFruit(position);
  }

  /** 根据触摸事件计算节点坐标 */
  private getNodePosition(event: EventTouch): Vec3 {
    const location = event.getLocation();
    const position = this.node
      .getComponent(UITransform)
      .convertToNodeSpaceAR(new Vec3(location.x, location.y, 0));
    return position;
  }

  /** 生成一个水果（随机等级） */
  spawnFruit(position: Vec3): void {
    if (!this.fruitPrefab) return;

    const fruitNode = instantiate(this.fruitPrefab);
    fruitNode.parent = this.gameArea || this.node;
    fruitNode.setPosition(position);

    // 随机生成低级水果（0-3 级）
    const randomLevel = Math.floor(Math.random() * 4);
    const fruitComp = fruitNode.getComponent(Fruit);
    if (fruitComp) {
      fruitComp.level = randomLevel;
    }
  }

  /** 水果合成处理 */
  private onFruitMerge(fruitA: Fruit, fruitB: Fruit): void {
    const mergePosition = this.getMergePosition(fruitA, fruitB);

    // 销毁两个旧水果
    fruitB.node.destroy();

    // 升级水果 A
    fruitA.upgradeLevel();
    fruitA.node.setPosition(mergePosition);
  }

  /** 计算合成后的位置（两个水果的中点） */
  private getMergePosition(fruitA: Fruit, fruitB: Fruit): Vec3 {
    const posA = fruitA.node.getPosition();
    const posB = fruitB.node.getPosition();
    return new Vec3(
      (posA.x + posB.x) / 2,
      Math.max(posA.y, posB.y),
      0
    );
  }

  /** 游戏结束 → 停止生成 */
  private onGameOver(): void {
    this.canSpawn = false;
  }

  /** 重置状态（新一局开始时调用） */
  reset(): void {
    this.canSpawn = true;
    // 清除所有水果
    const container = this.gameArea || this.node;
    const children = [...container.children];
    for (const child of children) {
      if (child.getComponent(Fruit)) {
        child.destroy();
      }
    }
  }

  protected onDestroy(): void {
    GameEvents.off(GameEvent.TOUCH_END, this.onTouchEnd, this);
    GameEvents.off(GameEvent.FRUIT_MERGE, this.onFruitMerge, this);
    GameEvents.off(GameEvent.GAME_OVER, this.onGameOver, this);
  }
}