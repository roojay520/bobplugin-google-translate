import { isString } from './util';
import BobCore from './core';

interface Store {
  [propName: string]: any;
}

/**
 * @description 数据缓存
 * @export
 * @class Cache
 */
export default class Cache {
  /**
   * Creates an instance of Cache.
   * @param {string} [nameSpace='bobplug-cache'] 命名空间
   * @memberof Cache
   */
  private _store: Store;

  private _cacheFilePath = '';

  constructor(nameSpace = 'bobplug-cache') {
    this._store = {};
    this._cacheFilePath = `$sandbox/cache/${nameSpace}.json`;
    this._read();
  }

  _write() {
    const json = JSON.stringify(this._store);
    BobCore.$file.write({
      data: BobCore.$data.fromUTF8(json),
      path: this._cacheFilePath,
    });
  }

  _read() {
    var exists = BobCore.$file.exists(this._cacheFilePath);
    if (exists) {
      var data = BobCore.$file.read(this._cacheFilePath);
      this._store = JSON.parse(data.toUTF8());
    } else {
      this._store = {};
      this._write();
    }
  }

  set(key: string, value: any) {
    if (!isString(key)) return;
    this._store[key] = value;
    this._write();
  }

  get(key: string) {
    if (!isString(key)) return null;
    return this._store[key];
  }

  getAll() {
    return this._store;
  }

  remove(key: string) {
    if (!isString(key)) return;
    delete this._store[key];
    this._write();
  }

  clear() {
    this._store = {};
    this._write();
  }
}
