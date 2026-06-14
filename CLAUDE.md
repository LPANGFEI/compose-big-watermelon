# CLAUDE.md — 合成大西瓜项目 AI 开发指南

## 项目信息

- **引擎**: Cocos Creator 3.8.8
- **语言**: TypeScript (`strict: false`)
- **类型**: 2D 休闲游戏 Demo

## 架构规则（红线）

### 分层约束

| 层          | 可 import               | 不可 import  |
| ----------- | ----------------------- | ------------ |
| `Manager/`  | Config, Event, Gameplay | 其他 Manager |
| `Gameplay/` | Config, Event           | Manager      |
| `UI/`       | Event                   | Manager      |

Manager 之间通过 `GameEvents` 事件通信，不直接 import。

### 数据流

```
TouchManager → TOUCH_* → FruitManager
Fruit.ts → FRUIT_MERGE → FruitManager + ScoreManager
DeathLine → GAME_OVER → GameManager + GamePage
ScoreManager → SCORE_UPDATED → HomePage / GamePage
UI 按钮 → START_GAME / RESTART_GAME / RETURN_HOME → GameManager
```

### 事件生命周期

Component 类：

```ts
// onLoad / start 中注册
GameEvents.on(GameEvent.XXX, this.handler, this);
// onDestroy 中必须 off
GameEvents.off(GameEvent.XXX, this.handler, this);
```

纯 TS 单例（GameManager）：

```ts
// init() 中注册，dispose() 中移除
GameManager.instance.init();
GameManager.instance.dispose();
```

## 命名规范

| 类型       | 规范             | 示例                       |
| ---------- | ---------------- | -------------------------- |
| 文件名     | PascalCase       | `FruitManager.ts`          |
| `@ccclass` | 与文件名一致     | `@ccclass("FruitManager")` |
| 事件名     | UPPER_SNAKE_CASE | `FRUIT_MERGE`              |
| 私有方法   | camelCase        | `private onFruitMerge()`   |
| 常量       | UPPER_SNAKE_CASE | `MAX_LEVEL`                |

## Manager 单例模式

**Component 类（FruitManager / ScoreManager / TouchManager）：**

```ts
@ccclass("XxxManager")
export class XxxManager extends Component {
  static instance: XxxManager;
  protected onLoad(): void {
    XxxManager.instance = this;
  }
}
```

**纯 TS 单例（GameManager）：**

```ts
export class GameManager {
  static instance = new GameManager();
  private constructor() {}
  // 幂等 init，在 HomePage.onLoad() 中调用
  init(): void { ... }
}
```

GameManager 不再依赖场景节点，无需 persistRootNode。HomePage.onLoad() 中调用 `GameManager.instance.init()` 完成初始化。

## 常用命令

- 打开项目：Cocos Creator 3.8.8 → 打开本目录
- 预览：编辑器内点击运行按钮
- 无 CLI 构建 / lint 命令

## 深入文档

- 水果配置：`assets/Scripts/Config/GameConfig.ts`
- 事件定义：`assets/Scripts/Event/GameEvents.ts`
- 代码结构速览：`README.md`
