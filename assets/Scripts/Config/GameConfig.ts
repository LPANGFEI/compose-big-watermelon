/**
 * 游戏全局常量配置
 * 所有可调参数集中管理，改数值不用搜遍全项目
 */
export const GameConfig = {
  SCENE_NAME: {
    /** 首页场景名 */
    HOME_SCENE: "Home",
    /** 游戏场景名 */
    GAME_SCENE: "Game",
  },

  /** 最高分 localStorage 存储 key */
  BEST_SCORE_KEY: "bestScore",

  /** 水果生成间隔（秒） */
  SPAWN_INTERVAL: 1,

  /** 水果生成 Y 坐标 */
  SPAWN_POSITION_OFFSET: 100,

  /** 水果生成 Y 坐标备用值（当死亡线节点不存在时） */
  SPAWN_POSITION_Y_FALLBACK: 400,

  /** 水果生成 X 坐标范围（匹配场景底板宽 800px, UI 可见区 ±360） */
  SPAWN_POSITION_X_MIN: -350,
  SPAWN_POSITION_X_MAX: 350,

  /**
   * 水果类型配置
   * level: 等级（数字越大越高级，两个同级水果合成升一级）
   * name:  显示名称
   * score: 合成该等级水果获得的分数
   * radius: 碰撞半径
   */
  FRUIT_TYPES: [
    { level: 0, name: "樱桃", score: 1, radius: 27 },
    { level: 1, name: "草莓", score: 2, radius: 40 },
    { level: 2, name: "葡萄", score: 4, radius: 55 },
    { level: 3, name: "橘子", score: 8, radius: 60 },
    { level: 4, name: "苹果", score: 16, radius: 78 },
    { level: 5, name: "梨", score: 32, radius: 93 },
    { level: 6, name: "桃子", score: 64, radius: 94 },
    { level: 7, name: "菠萝", score: 128, radius: 130 },
    { level: 8, name: "哈密瓜", score: 256, radius: 155 },
    { level: 9, name: "西瓜", score: 512, radius: 152 },
  ],

  /** 最高等级（合成到西瓜即为最终） */
  MAX_LEVEL: 9,
};
