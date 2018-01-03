/**
 * @file utils.js
 * 此文件中定义了矩形类和一些通用工具函数
 */

/**
 * 矩形区域类
 */
class Rect {
  /**
   * @constructor
   * @param x 左上顶点 x 坐标
   * @param y 左上顶点 y 坐标
   * @param width
   * @param height
   */
  constructor ([x = 0, y = 0] = [], [width = 0, height = 0] = []) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
  }

  /**
   * @getter
   * @returns {number}
   */
  get x1 () {
    return this.x
  }

  /**
   * @getter
   * @returns {number}
   */
  get y1 () {
    return this.y
  }

  /**
   * @getter
   * @returns {number}
   */
  get x2 () {
    return this.x + this.width
  }

  /**
   * @getter
   * @returns {number}
   */
  get y2 () {
    return this.y + this.height
  }
}

/**
 * 加载图片键值对集合
 * @param urlDict {Object} {name1: url1, name2: url2, ...}
 */
function loadImages (urlDict) {
  let urls = Object.values(urlDict)
  for (let url of urls) {
    resources.load(url)
  }
}

/**
 * 检测矩形区域 rect1 和矩形区域 rect2 是否有重叠
 * @param rect1 {Rect}
 * @param rect2 {Rect}
 * @returns {Boolean}
 */
function overlapping (rect1, rect2) {
  return Math.abs(rect1.x1 - rect2.x2) < rect1.width + rect2.width
    && Math.abs(rect1.x2 - rect2.x1) < rect1.width + rect2.width
    && Math.abs(rect1.y1 - rect2.y2) < rect1.height + rect2.height
    && Math.abs(rect1.y2 - rect2.y1) < rect1.height + rect2.height
}

/**
 * 检测 矩形区域 myRect 是否在矩形区域 rect 内部
 * @param myRect {Rect}
 * @param rect {Rect}
 * @returns {Boolean}
 */
function inRect (myRect, rect) {
  return (myRect.x1 >= rect.x1 && myRect.y1 >= rect.y1
    && myRect.x2 <= rect.x2 && myRect.y2 <= rect.y2)
}

/**
 * 以行和列为单位，创建与地图块对齐的矩形区域
 * @param row 起始行
 * @param col 起始列
 * @param rowsNum 行数
 * @param colsNum 列数
 * @returns {Rect}
 */
function createGroundRect (row, col, rowsNum, colsNum) {
  return new Rect([col * COL_W, row * ROW_H + OFFSET_V],
    [colsNum * COL_W, rowsNum * ROW_H])
}

/**
 * 根据 baseRect 和 shapeRelationMatrix 生成模拟复杂形状的矩形集。
 * @param baseRect {Rect}
 * @param shapeRelationMatrix {[[Rect, ...], ..]}
 * 形状关系矩阵，它的每一行表示用来模拟复杂形状的矩形集中的一个矩形的位置和尺寸
 * 相对于 baseRect 的位置和尺寸的比例关系， 假设形状矩形集中的一个矩形为 rect，
 * 则它对应的 shapeRelationMatrix 行为
 * [(rect.x - baseRect.x) / baseRect.width, (rect.y - baseRect.y) / baseRect.height,
 *  rect.width / baseRect.width, rect.height / baseRect.height]
 * @returns {Array}
 */
function getShapeRects (baseRect, shapeRelationMatrix) {
  let shapeRects = []

  for (let matrixRow of shapeRelationMatrix) {
    shapeRects.push(new Rect([
      baseRect.x + baseRect.width * matrixRow[0],
      baseRect.y + baseRect.height * matrixRow[1]
    ], [
      baseRect.width * matrixRow[2],
      baseRect.height * matrixRow[3]
    ]))
  }

  return shapeRects
}

/**
 * 检测以形状矩形集表示的两个图形之间是否有碰撞
 * @param firstShapeRects {[Rect, ...]}
 * @param secondShapeRects {[Rect, ...]}
 * @returns {Boolean}
 */
function shapesInCollision (firstShapeRects, secondShapeRects) {
  for (let firstShapeRect of firstShapeRects) {
    for (let secondShapeRect of secondShapeRects) {
      if (overlapping(firstShapeRect, secondShapeRect)) {
        return true
      }
    }
  }
  return false
}

