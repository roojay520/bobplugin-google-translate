/* eslint-disable max-len */
export var userAgent = `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36`;
export var googleNid = `NID=204=jKqc7wKrG7-x9wg-nlvxczNd7zMMzWF6Ohx0hLu77vL4GAUwQ0xh-mX3xzY1DUyJZhkQ5HCLIKwW4jX39lt7fSREShR45jIJi9Kz52l_XCIl7zP1wGfnaMfy455Dy0YNO1RBrVS46ix4OxSynS5AXGjJnFvbtC8KDRmep5Qx9sw`;
export function error(
  type: Bob.ServiceErrorType = 'unknown',
  message = '插件出错',
  addtion: any = {},
): Bob.ServiceError {
  return {
    type,
    message,
    addtion: JSON.stringify(addtion),
  };
}

export var isArray = (val: any) => Array.isArray(val);
export var isArrayAndLenGt = (val: any, len = 0) => isArray(val) && val.length > len;
export var isString = (val: any) => typeof val === 'string';
export var isPlainObject = (val: any) => !!val && typeof val === 'object' && val.constructor === Object;
export var isNil = (val: any) => val === undefined || val === null;

export function deepClone(obj: any) {
  if (!isPlainObject) return obj;
  const clone = { ...obj };
  Object.keys(clone).forEach((key) => (clone[key] = typeof obj[key] === 'object' ? deepClone(obj[key]) : obj[key]));
  return Array.isArray(obj) ? (clone.length = obj.length) && Array.from(clone) : clone;
}

export function getType(v: any) {
  return Reflect.toString.call(v).slice(8, -1).toLowerCase();
}

export async function asyncTo<T, U = any>(
  promise: Promise<T>,
  errorExt?: Record<string, unknown>,
): Promise<[U | null, T | undefined]> {
  try {
    const data = await promise;
    const result: [null, T] = [null, data];
    return result;
  } catch (err) {
    if (errorExt) {
      Object.assign(err, errorExt);
    }
    const resultArr: [U, undefined] = [err, undefined];
    return resultArr;
  }
}

export default {
  error,
  isString,
  isArray,
  isArrayAndLenGt,
  isPlainObject,
  deepClone,
  getType,
  asyncTo,
  userAgent,
  googleNid,
};
