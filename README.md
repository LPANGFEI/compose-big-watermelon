# 合成大西瓜 (Compose Big Watermelon)

Cocos Creator 3.8.8 2D 游戏 Demo。

## 技术栈

- **引擎**: Cocos Creator 3.8.8
- **语言**: TypeScript
- **物理**: 2D 碰撞系统 (Collider2D)

## 快速开始

1. 用 Cocos Creator 3.8.8 打开本项目根目录
2. 在编辑器中打开 `assets/Scenes/Home.scene` 即首页场景
3. 点击编辑器顶部运行按钮预览

## 项目结构

```
assets/
├── Art/              # 图片/音频资源
├── Prefabs/Game/     # 预制体 (Fruit, Floor)
├── Scenes/           # 场景 (Home, Game)
├── Animations/       # 动画
└── Scripts/
    ├── Boot.ts         # 启动入口（初始化纯 TS 单例）
    ├── Config/         # 全局常量 (GameConfig.ts)
    ├── Event/          # 事件总线 + 枚举 (GameEvents.ts)
    ├── Manager/        # 全局单例管理器
    │   ├── GameManager.ts    # 生命周期
    │   ├── FruitManager.ts   # 水果生成/合成
    │   ├── ScoreManager.ts   # 分数 + 持久化
    │   └── TouchManager.ts   # 触摸收口
    ├── Gameplay/     # 游戏实体 (Fruit.ts, DeathLine.ts)
    └── UI/           # 页面 UI (HomePage.ts, GamePage.ts)
```

## 架构

**Manager 派架构** — 逻辑集中在 Manager 单例，通过事件总线通信。

```
TouchManager → TOUCH_* → FruitManager
Fruit.ts → FRUIT_MERGE → FruitManager + ScoreManager
DeathLine → GAME_OVER → GameManager + GamePage
ScoreManager → SCORE_UPDATED → HomePage / GamePage
UI 按钮 → START_GAME / RESTART_GAME / RETURN_HOME → GameManager
```

**单例模式**：
- **纯 TS 单例**：GameManager / ScoreManager / TouchManager（无 Component 依赖，`init()` 幂等初始化）
- **Component 单例**：FruitManager（需要编辑器绑定预制体和节点引用）

**核心规则**：Gameplay / UI 层不 import Manager，只通过 GameEvents 事件通信。
