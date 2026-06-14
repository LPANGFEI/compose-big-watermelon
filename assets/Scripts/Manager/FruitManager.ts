import { Fruit } from "../Gameplay/Fruit";
import { GameConfig } from "../Config/GameConfig";
import { GameEvent, GameEvents } from "../Event/GameEvents";
import { ScoreManager } from "./ScoreManager";
import {
  _decorator,
  Component,
  EventTouch,
  instantiate,
  Node,
  Prefab,
  UITransform,
  Vec3,
} from "cc";

const { ccclass, property } = _decorator;

/**
 * 水果生成与合成管理器。
 *
 * 触碰流程：
 *   TOUCH_START → 显示 GuideLine（不创建水果）
 *   TOUCH_MOVE  → GuideLine 水平跟随触摸
 *   TOUCH_END   → 在 GuideLine 当前位置创建水果 → 隐藏 GuideLine → 预生成下一等级
 *
 *  水果出生即 RigidBody Dynamic，直接受重力下落。无"等待区"阶段。
 *
 * 注意：FruitManager 打破了"Manager 之间不直接 import"的规则，
 * 直接引用 ScoreManager.addScore()。原因：
 *   避免 ScoreManager 通过事件监听 FRUIT_MERGE 带来的时序耦合
 *   （ScoreManager 的分数计算依赖 FruitManager 先执行 upgradeLevel()）。
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

  @property({ type: Node, tooltip: "引导线节点" })
  guideLineNode: Node = null;

  /** 是否允许生成水果 */
  private canSpawn: boolean = true;

  private nextFruitLevel: number = 0;

  protected onLoad(): void {
    FruitManager.instance = this;

    GameEvents.on(GameEvent.TOUCH_START, this.onTouchStart, this);
    GameEvents.on(GameEvent.TOUCH_MOVE, this.onTouchMove, this);
    GameEvents.on(GameEvent.TOUCH_END, this.onTouchEnd, this);
    GameEvents.on(GameEvent.FRUIT_MERGE, this.onFruitMerge, this);
    GameEvents.on(GameEvent.GAME_OVER, this.onGameOver, this);

    if (this.guideLineNode) {
      this.guideLineNode.active = false;
    }

    this.generateNextLevel();
  }

  protected onDestroy(): void {
    GameEvents.off(GameEvent.TOUCH_START, this.onTouchStart, this);
    GameEvents.off(GameEvent.TOUCH_MOVE, this.onTouchMove, this);
    GameEvents.off(GameEvent.TOUCH_END, this.onTouchEnd, this);
    GameEvents.off(GameEvent.FRUIT_MERGE, this.onFruitMerge, this);
    GameEvents.off(GameEvent.GAME_OVER, this.onGameOver, this);
    this.unschedule(this.onSpawnCooldownEnd);
    this.hideGuideLine();
  }

  /** 触摸开始 → 创建待生成水果 & 显示引导线 */
  private onTouchStart(event: EventTouch): void {
    if (!this.canSpawn) return;

    const clampedX = this.clampTouchX(event);
    this.showGuideLine(clampedX);
  }

  /** 触摸移动 → 待生成水果 + 引导线跟随手指 X 轴 */
  private onTouchMove(event: EventTouch): void {
    if (!this.guideLineNode || !this.guideLineNode.active) return;

    const clampedX = this.clampTouchX(event);
    const guidePos = this.guideLineNode.getPosition();
    this.guideLineNode.setPosition(new Vec3(clampedX, guidePos.y, guidePos.z));
  }

  /** 触摸结束 → 在 GuideLine 当前位置创建水果 → 隐藏 GuideLine → 预生成下一等级 */
  private onTouchEnd(): void {
    if (!this.guideLineNode || !this.guideLineNode.active) return;

    const guidePos = this.guideLineNode.getPosition();
    this.spawnFruit(guidePos.x, guidePos.y);
    this.hideGuideLine();
    this.generateNextLevel();

    this.canSpawn = false;
    this.scheduleOnce(this.onSpawnCooldownEnd, GameConfig.SPAWN_INTERVAL);
  }

  /** 创建水果 */
  private spawnFruit(x: number, y: number): void {
    if (!this.fruitPrefab) return;

    const fruitNode = instantiate(this.fruitPrefab);
    fruitNode.parent = this.gameArea;
    fruitNode.setPosition(new Vec3(x, y, 0));

    const fruitComp = fruitNode.getComponent(Fruit);
    if (fruitComp) {
      fruitComp.level = this.nextFruitLevel;
    }
  }

  /** 预生成下一等级 */
  private generateNextLevel(): void {
    this.nextFruitLevel = Math.floor(Math.random() * 4);
    GameEvents.emit(GameEvent.NEXT_FRUIT_LEVEL, this.nextFruitLevel);
  }

  /** 显示引导线 */
  private showGuideLine(x: number): void {
    if (this.guideLineNode) {
      this.guideLineNode.active = true;
      const guidePos = this.guideLineNode.getPosition();
      this.guideLineNode.setPosition(new Vec3(x, guidePos.y, guidePos.z));
    }
  }

  /** 隐藏引导线 */
  private hideGuideLine(): void {
    if (this.guideLineNode) {
      this.guideLineNode.active = false;
    }
  }

  private clampTouchX(event: EventTouch): number {
    const location = event.getLocation();
    const position = this.node
      .getComponent(UITransform)
      .convertToNodeSpaceAR(new Vec3(location.x, location.y, 0));

    return Math.max(
      GameConfig.SPAWN_POSITION_X_MIN,
      Math.min(GameConfig.SPAWN_POSITION_X_MAX, position.x),
    );
  }

  /** 生成冷却结束 → 允许生成水果 */
  private onSpawnCooldownEnd(): void {
    this.canSpawn = true;
  }

  /** 水果合并事件 */
  private onFruitMerge(fruitA: Fruit, fruitB: Fruit): void {
    const mergePosition = this.getMergePosition(fruitA, fruitB);

    this.scheduleOnce(() => {
      fruitB.node.destroy();
    }, 0);

    fruitA.upgradeLevel();
    const config = GameConfig.FRUIT_TYPES[fruitA.level];
    ScoreManager.instance.addScore(config.score);
    fruitA.node.setPosition(mergePosition);
  }

  /** 计算合并位置 */
  private getMergePosition(fruitA: Fruit, fruitB: Fruit): Vec3 {
    const posA = fruitA.node.getPosition();
    const posB = fruitB.node.getPosition();
    return new Vec3((posA.x + posB.x) / 2, Math.max(posA.y, posB.y), 0);
  }

  /** 游戏结束 → 隐藏引导线 */
  private onGameOver(): void {
    this.canSpawn = false;
    this.hideGuideLine();
  }

  /** 重置游戏状态 */
  reset(): void {
    this.unschedule(this.onSpawnCooldownEnd);
    this.canSpawn = true;
    this.hideGuideLine();
    this.generateNextLevel();
    const container = this.gameArea || this.node;
    const children = [...container.children];
    for (const child of children) {
      if (child.getComponent(Fruit)) {
        child.destroy();
      }
    }
  }
}
