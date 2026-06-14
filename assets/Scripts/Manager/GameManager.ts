import { _decorator, Component, director, Node } from "cc";
import { GameConfig } from "../Config/GameConfig";
import { GameEvent, GameEvents } from "../Event/GameEvents";

const { ccclass, property } = _decorator;

/**
 * 游戏生命周期管理器（单例 Component）
 *
 * 职责：
 *   1. 控制游戏整体流程：开始 / 结束 / 重启 / 返回首页
 *   2. 协调各子 Manager 的状态
 *
 * 挂在场景根节点的持久化节点上，通过 director.addPersistRootNode 跨场景存活。
 *
 * 依赖关系：
 *   GameManager 不直接 import 其他 Manager，
 *   所有协调通过 GameEvents 事件完成。
 */
@ccclass("GameManager")
export class GameManager extends Component {
  static instance: GameManager;

  /** 当前游戏是否进行中 */
  private isPlaying: boolean = false;

  protected onLoad(): void {
    GameManager.instance = this;
    // 跨场景持久化 — 确保节点是场景根节点
    const scene = director.getScene();
    if (this.node.parent && scene && this.node.parent !== scene) {
      this.node.removeFromParent();
    }
    director.addPersistRootNode(this.node);

    // 监听生命周期事件
    GameEvents.on(GameEvent.START_GAME, this.onStartGame, this);
    GameEvents.on(GameEvent.RESTART_GAME, this.onRestartGame, this);
    GameEvents.on(GameEvent.RETURN_HOME, this.onReturnHome, this);
    GameEvents.on(GameEvent.GAME_OVER, this.onGameOver, this);
  }

  /** 开始游戏 → 切换到游戏场景 */
  private onStartGame(): void {
    this.isPlaying = true;
    director.loadScene(GameConfig.SCENE_NAME.GAME_SCENE);
  }

  /** 重新开始 → 重载当前场景，重置所有状态 */
  private onRestartGame(): void {
    this.isPlaying = true;
    director.loadScene(GameConfig.SCENE_NAME.GAME_SCENE);
  }

  /** 游戏结束 → 标记为未进行 */
  private onGameOver(): void {
    this.isPlaying = false;
  }

  /** 返回首页 */
  private onReturnHome(): void {
    this.isPlaying = false;
    director.loadScene(GameConfig.SCENE_NAME.HOME_SCENE);
  }

  /** 当前是否游戏中 */
  get isGamePlaying(): boolean {
    return this.isPlaying;
  }

  protected onDestroy(): void {
    GameEvents.off(GameEvent.START_GAME, this.onStartGame, this);
    GameEvents.off(GameEvent.RESTART_GAME, this.onRestartGame, this);
    GameEvents.off(GameEvent.RETURN_HOME, this.onReturnHome, this);
    GameEvents.off(GameEvent.GAME_OVER, this.onGameOver, this);
  }
}
