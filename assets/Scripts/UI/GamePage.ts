import { _decorator, Component, Label, Node } from "cc";
import { GameEvent, GameEvents } from "../Event/GameEvents";

const { ccclass, property } = _decorator;

/**
 * 游戏页 UI 组件
 *
 * 职责：只做 UI 绑定和按钮事件转发。
 * 分数刷新监听 SCORE_UPDATED 事件，按钮点击 emit 对应事件给 Manager 处理。
 */
@ccclass("GamePage")
export class GamePage extends Component {
  @property({ type: Label, tooltip: "当前分数显示" })
  scoreLabel: Label = null;

  @property({ type: Label, tooltip: "最高分显示" })
  bestScoreLabel: Label = null;

  @property({ type: Node, tooltip: "游戏结束弹窗节点" })
  gameOverPanel: Node = null;

  protected onLoad(): void {
    // 监听分数更新
    GameEvents.on(GameEvent.SCORE_UPDATED, this.onScoreUpdated, this);
    // 监听游戏结束
    GameEvents.on(GameEvent.GAME_OVER, this.onGameOver, this);

    // 初始化隐藏结束弹窗
    if (this.gameOverPanel) {
      this.gameOverPanel.active = false;
    }
  }

  /** 分数更新 → 刷新 UI */
  private onScoreUpdated(currentScore: number, bestScore: number): void {
    if (this.scoreLabel) {
      this.scoreLabel.string = currentScore.toString();
    }
    if (this.bestScoreLabel) {
      this.bestScoreLabel.string = bestScore.toString();
    }
  }

  /** 游戏结束 → 显示弹窗 */
  private onGameOver(): void {
    if (this.gameOverPanel) {
      this.gameOverPanel.active = true;
    }
  }

  /** 点击"重新开始"按钮 */
  onClickRestart(): void {
    GameEvents.emit(GameEvent.RESTART_GAME);
  }

  /** 点击"返回首页"按钮 */
  onClickReturnHome(): void {
    GameEvents.emit(GameEvent.RETURN_HOME);
  }

  protected onDestroy(): void {
    GameEvents.off(GameEvent.SCORE_UPDATED, this.onScoreUpdated, this);
    GameEvents.off(GameEvent.GAME_OVER, this.onGameOver, this);
  }
}