import { _decorator, CCInteger, Component, Node, Prefab } from "cc";
const { ccclass, property } = _decorator;

@ccclass("GameManager")
export class GameManager extends Component {
  @property({
    type: CCInteger,
    tooltip: "定时器",
  })
  timer: number = 1;

  @property({
    type: Prefab,
    tooltip: "水果预制体",
  })
  fruitPrefab: Prefab = null;

  @property({
    type: Node,
    tooltip: "引导线节点",
  })
  guideLineNode: Node = null;

  // 是否可以生成
  isCanSpawn: boolean = true;

  start() {}

  update(deltaTime: number) {}
}
