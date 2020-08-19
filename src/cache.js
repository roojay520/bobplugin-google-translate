import { isString } from './util';

/**
 * @description 数据缓存
 * @export
 * @class CacheStore
 */
export default class CacheStore {
  /**
   * Creates an instance of CacheStore.
   * @param {string} [nameSpace='bobplug-cache'] 命名空间
   * @memberof CacheStore
   */
  constructor(nameSpace = 'bobplug-cache') {
    this._store = {};
    this._cacheFilePath = `$sandbox/cache/${nameSpace}.json`;
    this._read();
  }

  /**
   * @description 将缓存数据保存到磁盘文件中
   * @memberof CacheStore
   */
  _write() {
    const json = JSON.stringify(this._store);
    $file.write({
      data: $data.fromUTF8(json),
      path: this._cacheFilePath,
    });
  }

  /**
   * @description 从磁盘读取缓存文件
   * @memberof CacheStore
   */
  _read() {
    var exists = $file.exists(this._cacheFilePath);
    if (exists) {
      var data = $file.read(this._cacheFilePath);
      this._store = JSON.parse(data.toUTF8());
    } else {
      this._store = {};
      this._write();
    }
  }

  /**
   * @description 缓存一个值
   * @param {string} key
   * @param {any} value
   * @return {void}
   * @memberof CacheStore
   */
  set(key, value) {
    if (!isString(key)) return;
    this._store[key] = value;
    this._write();
  }

  /**
   * @description 根据 key 值读取一个缓存值
   * @param {string} key
   * @return {any}
   * @memberof CacheStore
   */
  get(key) {
    if (!isString(key)) return;
    return this._store[key];
  }

  /**
   * @description 获取所有缓存值
   * @return {any}
   * @memberof CacheStore
   */
  getAll() {
    return this._store;
  }

  /**
   * @description 根据 key 值移除一个缓存值
   * @param {string} key
   * @return {void}
   * @memberof CacheStore
   */
  remove(key) {
    if (!isString(key)) return;
    delete this._store[key];
    this._write();
  }

  /**
   * @description 移除所有缓存值
   * @memberof CacheStore
   */
  clear() {
    this._store = {};
    this._write();
  }
}
