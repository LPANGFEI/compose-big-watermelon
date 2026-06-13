# CLAUDE.md — 合成大西瓜项目 AI 开发指南

## 项目信息

- **引擎**: Cocos Creator 3.8.8
- **语言**: TypeScript (`strict: false`)
- **类型**: 2D 休闲游戏 Demo

## 架构规则（红线）

### 分层约束

| 层 | 可 import | 不可 import |
|---|---|---|
| `Manager/` | Config, Event, Gameplay, Components | 其他 Manager |
| `Components/` | Event | Manager |
| `Gameplay/` | Config, Event | Manager |
| `UI/` | Event | Manager |

Manager 之间通过 `GameEvents` 事件通信，不直接 import。

### 数据流

```
Touch.ts → RAW_TOUCH_* → TouchManager → TOUCH_* → FruitManager
Fruit.ts → FRUIT_MERGE → FruitManager + ScoreManager
DeathLine → GAME_OVER → GameManager + GamePage
ScoreManager → SCORE_UPDATED → HomePage / GamePage
UI 按钮 → START_GAME / RESTART_GAME / RETURN_HOME → GameManager
```

### 事件生命周期

```ts
// onLoad / start 中注册
GameEvents.on(GameEvent.XXX, this.handler, this);
// onDestroy 中必须 off
GameEvents.off(GameEvent.XXX, this.handler, this);
```

## 命名规范

| 类型 | 规范 | 示例 |
|---|---|---|
| 文件名 | PascalCase | `FruitManager.ts` |
| `@ccclass` | 与文件名一致 | `@ccclass("FruitManager")` |
| 事件名 | UPPER_SNAKE_CASE | `FRUIT_MERGE` |
| 私有方法 | camelCase | `private onFruitMerge()` |
| 常量 | UPPER_SNAKE_CASE | `MAX_LEVEL` |

## Manager 单例模式

```ts
@ccclass("XxxManager")
export class XxxManager extends Component {
  static instance: XxxManager;
  protected onLoad(): void {
    XxxManager.instance = this;
  }
}
// 外部访问: XxxManager.instance.method()
```

需要跨场景存活的 Manager 在 `GameManager.onLoad()` 中调用 `director.addPersistRootNode(this.node)`。

## 触摸事件双通道

`Touch.ts` 使用 `RAW_TOUCH_*` 前缀（内部），`TouchManager` 过滤后广播标准 `TOUCH_*`。业务层只监听 `TOUCH_*`，不监听 `RAW_TOUCH_*`。

## 常用命令

- 打开项目：Cocos Creator 3.8.8 → 打开本目录
- 预览：编辑器内点击运行按钮
- 无 CLI 构建 / lint 命令

## 深入文档

- 架构详情：对话历史中 `grill-me` 阶段
- 代码审查结果：对话历史中 `frontend-code-review` 阶段
- 水果配置：`assets/Scripts/Config/GameConfig.ts`
- 事件定义：`assets/Scripts/Event/GameEvents.ts`