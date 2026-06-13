import { Vec2 } from "cc";

// Config 层: 把项目里所有硬编码数字和常量集中到一个文件
// 好处: 改一个数值不用搜遍全项目, 初学者一看就知道有哪些可调参数
export const GameConfig = {
  // 每隔多少秒生成一个工作标签
  SPAWN_INTERVAL: 0.5,
  // 标签生成时的 Y 坐标 (屏幕顶部)
  SPAWN_POSITION_Y: 670,
  SPAWN_POSITION_X_MIN: -320,
  SPAWN_POSITION_X_MAX: 320,

  // 篮子拖拽时的边界限制, 防止拖出屏幕
  BASKET_BOUNDARY: {
    min: new Vec2(-260, -200),
    max: new Vec2(260, 300),
  },

  // 游戏结束动画参数 (BasketController.playEnding)
  ENDING_TWEEN: {
    LABEL_DURATION: 1,
    LABEL_END_Y: 100,
    BASKET_DURATION: 2,
    BASKET_END_Y: 170,
  },

  // 所有职业名称, SpawnManager 从这里读数据生成标签
  WORK_NAMES: [
    "董事长",
    "网红",
    "程序员",
    "保安",
    "外卖员",
    "快递员",
    "保洁员",
    "暴发户",
    "拆迁户",
    "公务员",
    "三和大神",
    "吃软饭",
  ],
};
