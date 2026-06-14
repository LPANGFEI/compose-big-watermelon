import { _decorator, Component, Label, Node, Sprite, SpriteAtlas } from "cc";
import { GameEvent, GameEvents } from "../Event/GameEvents";

const { ccclass, property } = _decorator;

/**
 * 游戏页 UI 组件。
 *
 * 职责：绑定分数显示、游戏结束弹窗、下一个水果预览（Slice）。
 * 数据通过 GameEvents 事件获取，不直接 import Manager。
 *
 * 场景中需手动绑定：
 *   - slicePreviewSprite → Slice 子节点的 Sprite
 *   - fruitAtlas → assets/Art/watermelon/watermelon.plist
 */
@ccclass("GamePage")
export class GamePage extends Component {
  @property({ type: Label, tooltip: "当前分数显示" })
  scoreLabel: Label = null;

  @property({ type: Node, tooltip: "游戏结束弹窗节点" })
  gameOverPanel: Node = null;

  @property({ type: Sprite, tooltip: "下一个水果预览 Sprite（Slice 子节点）" })
  slicePreviewSprite: Sprite = null;

  @property({ type: SpriteAtlas, tooltip: "水果精灵图集" })
  fruitAtlas: SpriteAtlas = null;

  protected onLoad(): void {
    GameEvents.on(GameEvent.SCORE_UPDATED, this.onScoreUpdated, this);
    GameEvents.on(GameEvent.GAME_OVER, this.onGameOver, this);
    GameEvents.on(GameEvent.NEXT_FRUIT_LEVEL, this.onNextFruitLevel, this);

    if (this.gameOverPanel) {
      this.gameOverPanel.active = false;
    }
  }

  protected onDestroy(): void {
    GameEvents.off(GameEvent.SCORE_UPDATED, this.onScoreUpdated, this);
    GameEvents.off(GameEvent.GAME_OVER, this.onGameOver, this);
    GameEvents.off(GameEvent.NEXT_FRUIT_LEVEL, this.onNextFruitLevel, this);
  }

  /** 分数更新 → 刷新 UI */
  private onScoreUpdated(currentScore: number, bestScore: number): void {
    if (this.scoreLabel) {
      this.scoreLabel.string = currentScore.toString();
    }
  }

  /** 游戏结束 → 显示弹窗 */
  private onGameOver(): void {
    if (this.gameOverPanel) {
      this.gameOverPanel.active = true;
    }
  }

  /** 下一个水果等级更新时，更新预览 Sprite。 */
  private onNextFruitLevel(level: number): void {
    if (this.slicePreviewSprite && this.fruitAtlas) {
      const spriteFrame = this.fruitAtlas.getSpriteFrame(level.toString());
      if (spriteFrame) {
        this.slicePreviewSprite.spriteFrame = spriteFrame;
      }
    }
  }

  /** 点击"重新开始"按钮 */
  onRestart(): void {
    GameEvents.emit(GameEvent.RESTART_GAME);
  }

  /** 点击"返回首页"按钮 */
  onReturnHome(): void {
    GameEvents.emit(GameEvent.RETURN_HOME);
  }
}
