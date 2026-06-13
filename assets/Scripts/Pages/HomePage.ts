import { _decorator, Component, director, Label, SceneAsset, sys } from "cc";
const { ccclass, property } = _decorator;

@ccclass("HomePage")
export class HomePage extends Component {
  @property({
    type: SceneAsset,
    tooltip: "游戏场景",
  })
  gameScene: SceneAsset = null;

  @property({
    type: Label,
    tooltip: "最高分数",
  })
  bestScore: Label = null;

  protected onLoad(): void {
    const bestScore = sys.localStorage.getItem("bestScore");
    if (bestScore) {
      this.bestScore.string = bestScore.toString();
    } else {
      this.bestScore.string = "0";
    }
  }

  onStartGame() {
    director.runScene(this.gameScene);
  }

  onExitGame() {
    director.end();
  }
}
