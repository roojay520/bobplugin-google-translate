export var ServerErrorType = ['unknown', 'param', 'unsupportLanguage', 'secretKey', 'network', 'api'];

/**
 * @description 生成一个符合插件格式的错误信息
 * @param {string} [type='unknown' | 'param' | 'unsupportLanguage' | 'secretKey' | 'network' | 'api']
 * @param {string} [message='插件出错']
 * @param {*} [addtion={}]
 * @return {*}
 */
export function getError(type = 'unknown', message = '插件出错', addtion = {}) {
  return {
    type,
    message,
    addtion: JSON.stringify(addtion),
  };
}

export var isArray = (val) => Array.isArray(val);
export var isArrayAndLenGt = (val, len = 0) => isArray(val) && val.length > len;
export var isString = (val) => typeof val === 'string';
export var isPlainObject = (val) => !!val && typeof val === 'object' && val.constructor === Object;

export function deepClone(obj) {
  if (!isPlainObject) return obj;
  const clone = { ...obj };
  Object.keys(clone).forEach((key) => (clone[key] = typeof obj[key] === 'object' ? deepClone(obj[key]) : obj[key]));
  return Array.isArray(obj) ? (clone.length = obj.length) && Array.from(clone) : clone;
}

export function getType(v) {
  return Reflect.toString.call(v).slice(8, -1).toLowerCase();
}

export function asyncTo(promise, errExt = {}) {
  return promise.then((data) => [null, data]).catch((err) => [{ ...err, ...errExt }]);
}

export default {
  ServerErrorType,
  getError,
  isString,
  isArray,
  isArrayAndLenGt,
  isPlainObject,
  deepClone,
  getType,
  asyncTo,
};
