// 此接口来源于: https://github.com/tingv/bobplugin-google-translate/blob/main/src/translate.ts
import * as querystring from 'querystring';
import { unescape } from 'lodash-es';
import * as Bob from '@bob-plug/core';
import { userAgentMobile } from './util';
import { IQueryOption } from './common';
import { noStandardToStandard } from './lang';
import { getBaseApi } from './common';

var resultCache = new Bob.CacheResult();
// 接口请求频率过快导致错误, 隔三分钟再请求
var API_LIMIT_TIME: number = 1000 * 60 * 3;
var apiLimitErrorTime = 0;
/**
 * @description google 翻译
 * @param {string} text 需要翻译的文字内容
 * @param {object} [options={}]
 * @return {object} 一个符合 bob 识别的翻译结果对象
 */
async function _translate(text: string, options: IQueryOption = {}) {
  if (text?.length > 5000) {
    throw Bob.util.error('param', '翻译文本过长, 单次翻译字符上限为5000');
  }
  if (apiLimitErrorTime + API_LIMIT_TIME > Date.now()) throw Bob.util.error('api', '请求频率过快, 请稍后再试');
  apiLimitErrorTime = 0;
  const { from = 'auto', to = 'auto', cache = 'enable', timeout = 10000 } = options;
  const cacheKey = `${text}${from}${to}${getBaseApi()}`;
  if (cache === 'enable') {
    const _cacheData = resultCache.get(cacheKey);
    if (_cacheData) return _cacheData;
  } else {
    resultCache.clear();
  }

  const data = {
    sl: from,
    tl: to,
    hl: to,
    q: text,
  };

  const [err, res] = await Bob.util.asyncTo<Bob.HttpResponse>(
    Bob.api.$http.get({
      url: `https://${getBaseApi()}/m?${querystring.stringify(data)}`,
      timeout,
      header: {
        'User-Agent': userAgentMobile,
      },
    }),
  );
  if (res?.response.statusCode === 429) {
    apiLimitErrorTime = Date.now();
    throw Bob.util.error('api', '接口请求频率过快', err);
  }

  if (err) throw Bob.util.error('network', '接口网络错误', err);

  const resData = res?.data;
  if (!Bob.util.isString(resData)) throw Bob.util.error('api', '接口返回数据出错', res);

  const result: Bob.Result = { from: noStandardToStandard(from), to: noStandardToStandard(to), toParagraphs: [] };

  try {
    const resultRegex = /<div[^>]*?class="result-container"[^>]*>[\s\S]*?<\/div>/gi;
    let _result = resultRegex.exec(resData)?.[0]?.replace(/(<\/?[^>]+>)/gi, '');
    _result = unescape(_result);
    result.toParagraphs = _result?.split('\n') || ['暂无结果'];
    result.fromParagraphs = text.split('\n');
  } catch (error) {
    throw Bob.util.error('api', '接口返回数据解析错误出错', error);
  }

  if (cache === 'enable') {
    resultCache.set(cacheKey, result);
  }
  // raw
  // result.raw = resData;
  return result;
}

export default {
  _translate,
};

export { _translate };
