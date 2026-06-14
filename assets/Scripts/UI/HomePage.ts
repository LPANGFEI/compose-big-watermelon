import { _decorator, Component, Label } from "cc";
import { GameEvent, GameEvents } from "../Event/GameEvents";

const { ccclass, property } = _decorator;

/**
 * 首页 UI 组件
 *
 * 职责：只做 UI 绑定和按钮事件转发。
 * 数据通过监听 SCORE_UPDATED 事件获取，不直接 import Manager。
 */
@ccclass("HomePage")
export class HomePage extends Component {
  @property({ type: Label, tooltip: "最高分显示" })
  bestScoreLabel: Label = null;

  protected onLoad(): void {
    GameEvents.on(GameEvent.SCORE_UPDATED, this.onScoreUpdated, this);
  }

  /** 分数更新 → 刷新最高分显示 */
  private onScoreUpdated(_currentScore: number, bestScore: number): void {
    if (this.bestScoreLabel) {
      this.bestScoreLabel.string = bestScore.toString();
    }
  }

  /** 点击"开始游戏"按钮 */
  onStartGame(): void {
    GameEvents.emit(GameEvent.START_GAME);
  }

  /** 仅对 window.open() 打开的窗口有效，浏览器中无法真正关闭页面 */
  onExitGame(): void {
    if (typeof window !== "undefined") {
      window.close();
    }
  }

  protected onDestroy(): void {
    GameEvents.off(GameEvent.SCORE_UPDATED, this.onScoreUpdated, this);
  }
}
