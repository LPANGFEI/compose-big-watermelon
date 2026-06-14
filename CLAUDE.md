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

### Manager 目录结构

Manager/ 均为单例，不拆分目录。按初始化方式分为两类：

```
Manager/
├── GameManager.ts      # 纯 TS 单例 | Boot.init() 管理
├── ScoreManager.ts     # 纯 TS 单例 | Boot.init() 管理
├── TouchManager.ts     # 纯 TS 单例 | Boot.init() 管理
└── FruitManager.ts     # Component 单例 | 场景 onLoad 自初始化
```

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

纯 TS 单例（GameManager / ScoreManager / TouchManager）：

```ts
// 在 Boot.ts 的 onLoad 中初始化（幂等，多次调用安全）
GameManager.instance.init();
ScoreManager.instance.init();
TouchManager.instance.init();
```

**启动流程**：Boot.ts 挂在 Home 场景 Canvas 节点上，负责初始化所有纯 TS 单例。

## 命名规范

| 类型       | 规范             | 示例                       |
| ---------- | ---------------- | -------------------------- |
| 文件名     | PascalCase       | `FruitManager.ts`          |
| `@ccclass` | 与文件名一致     | `@ccclass("FruitManager")` |
| 事件名     | UPPER_SNAKE_CASE | `FRUIT_MERGE`              |
| 私有方法   | camelCase        | `private onFruitMerge()`   |
| 常量       | UPPER_SNAKE_CASE | `MAX_LEVEL`                |

## Manager 单例模式

**纯 TS 单例（GameManager / ScoreManager / TouchManager）：**

```ts
export class XxxManager {
  static instance = new XxxManager();
  private constructor() {}
  private initialized = false;
  // 幂等 init，在 Boot.ts 的 onLoad 中调用
  init(): void {
    if (this.initialized) return;
    this.initialized = true;
    // 注册事件监听
  }
  dispose(): void { /* 移除事件监听 */ }
}
```

**Component 单例（FruitManager）：**

```ts
@ccclass("FruitManager")
export class FruitManager extends Component {
  static instance: FruitManager;
  protected onLoad(): void {
    FruitManager.instance = this;
    // 编辑器绑定的 @property 在此使用
  }
}
```

纯 TS 单例无 Component 依赖，通过 `init()` 幂等初始化。Boot.ts 挂在 Home 场景 Canvas 节点上统一初始化。

## 常用命令

- 打开项目：Cocos Creator 3.8.8 → 打开本目录
- 预览：编辑器内点击运行按钮
- 无 CLI 构建 / lint 命令

## 深入文档

- 水果配置：`assets/Scripts/Config/GameConfig.ts`
- 事件定义：`assets/Scripts/Event/GameEvents.ts`
- 代码结构速览：`README.md`
