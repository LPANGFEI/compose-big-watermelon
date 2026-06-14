import { _decorator, Component } from "cc";
import { GameManager } from "./Manager/GameManager";
import { ScoreManager } from "./Manager/ScoreManager";
import { TouchManager } from "./Manager/TouchManager";

const { ccclass } = _decorator;

/**
 * 启动入口脚本
 * 挂在 Home 场景的 Canvas 节点上，负责初始化纯 TS 单例管理器
 */
@ccclass("Boot")
export class Boot extends Component {
  protected onLoad(): void {
    GameManager.instance.init();
    ScoreManager.instance.init();
    TouchManager.instance.init();
  }
}
