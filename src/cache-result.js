import CacheStore from './cache';
import util from './util';
// eslint-disable-next-line import/no-unresolved
var CryptoJS = require('crypto-js');

/**
 * @description 根据翻译文字的 md5 值缓存翻译结果
 * 注意: 貌似插件不支持 ES6 的 Map Set 数据结构, 暂时先用对象
 * @export
 * @class ResultCache
 */
export default class ResultCache {
  /**
   * Creates an instance of ResultCache.
   * @memberof ResultCache
   */
  constructor() {
    this._resultCacheStore = new CacheStore('result-cache');
    let result = this._resultCacheStore.get('result') || {};
    if (!util.isPlainObject(result)) result = {};
    this._result = result;
  }

  /**
   * @description 将缓存值入磁盘
   * @memberof ResultCache
   */
  _save() {
    this._resultCacheStore.set('result', { ...this._result });
  }

  /**
   * @description 获取缓存结果
   * @param {string} key 翻译文字
   * @return {object || null} 缓存结果
   * @memberof ResultCache
   */
  get(key) {
    if (!util.isString(key)) return;
    const md5 = CryptoJS.MD5(key).toString();
    const result = this._result[md5];
    if (!util.isPlainObject(result)) return null;
    const { time, data } = result;
    const cacheUpdateTime = 1000 * 60 * 60 * 24 * 7; // 缓存时间一周
    if (Date.now() - cacheUpdateTime > time) {
      delete this._result[md5];
      this._save();
      return null;
    }
    return data;
  }

  /**
   * @description 缓存查询结果
   * @param {string} key 翻译文字
   * @param {object} val 翻译结果
   * @return {void}
   * @memberof ResultCache
   */
  set(key, val) {
    if (!util.isString(key) && !util.isPlainObject(val) && !util.isArrayAndLenGt(val.toParagraphs, 0)) return;
    const md5 = CryptoJS.MD5(key).toString();
    const result = { time: Date.now(), data: val };
    this._result[md5] = result;

    this._save();
  }
}
