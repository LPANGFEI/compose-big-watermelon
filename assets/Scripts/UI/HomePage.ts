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
    // 监听分数更新 —— ScoreManager.start() 会主动广播
    GameEvents.on(GameEvent.SCORE_UPDATED, this.onScoreUpdated, this);
  }

  /** 分数更新 → 刷新最高分显示 */
  private onScoreUpdated(_currentScore: number, bestScore: number): void {
    if (this.bestScoreLabel) {
      this.bestScoreLabel.string = bestScore.toString();
    }
  }

  /** 点击"开始游戏"按钮 */
  onClickStart(): void {
    GameEvents.emit(GameEvent.START_GAME);
  }

  /** 点击"退出游戏"按钮 */
  onClickExit(): void {
    // Cocos Creator 3.x 中 director.end() 已废弃，
    // Web 平台通过关闭标签页退出，原生平台通过平台 API
    if (typeof window !== "undefined") {
      window.close();
    }
  }

  protected onDestroy(): void {
    GameEvents.off(GameEvent.SCORE_UPDATED, this.onScoreUpdated, this);
  }
}