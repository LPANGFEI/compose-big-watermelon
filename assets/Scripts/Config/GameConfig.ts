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

  /** 水果生成 Y 坐标（屏幕顶部） */
  SPAWN_POSITION_OFFSET: 200,

  /** 水果生成 Y 坐标备用值（当死亡线节点不存在时） */
  SPAWN_POSITION_Y_FALLBACK: 300,

  /** 水果生成 X 坐标范围 */
  SPAWN_POSITION_X_MIN: -320,
  SPAWN_POSITION_X_MAX: 320,

  /** 游戏区域边界（防止水果拖出屏幕） */
  GAME_AREA_BOUNDARY: {
    minX: -260,
    maxX: 260,
    minY: -200,
    maxY: 300,
  },

  /** 死亡线 Y 坐标 —— 水果超过此线则游戏结束 */
  DEATH_LINE_Y: -400,

  /**
   * 水果类型配置
   * level: 等级（数字越大越高级，两个同级水果合成升一级）
   * name:  显示名称
   * score: 合成该等级水果获得的分数
   * radius: 碰撞半径
   */
  FRUIT_TYPES: [
    { level: 0, name: "樱桃", score: 1, radius: 25 },
    { level: 1, name: "草莓", score: 2, radius: 30 },
    { level: 2, name: "葡萄", score: 4, radius: 38 },
    { level: 3, name: "橘子", score: 8, radius: 46 },
    { level: 4, name: "苹果", score: 16, radius: 54 },
    { level: 5, name: "梨", score: 32, radius: 62 },
    { level: 6, name: "桃子", score: 64, radius: 70 },
    { level: 7, name: "菠萝", score: 128, radius: 78 },
    { level: 8, name: "哈密瓜", score: 256, radius: 86 },
    { level: 9, name: "西瓜", score: 512, radius: 94 },
  ],

  /** 最高等级（合成到西瓜即为最终） */
  MAX_LEVEL: 9,
};
