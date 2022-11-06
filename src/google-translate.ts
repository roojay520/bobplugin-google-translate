import * as querystring from 'querystring';
import * as Bob from '@bob-plug/core';
import { userAgent } from './util';
import { IQueryOption, detectLang, tts } from './common';
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

  const lang = await detectLang(text, options);
  const data = {
    client: 'gtx',
    sl: lang || from,
    tl: to,
    hl: to,
    dt: ['at', 'bd', 'ex', 'ld', 'md', 'qca', 'rw', 'rm', 'ss', 't'],
    ie: 'UTF-8',
    oe: 'UTF-8',
    otf: 1,
    ssel: 0,
    tsel: 0,
    kc: 7,
  };

  const [err, res] = await Bob.util.asyncTo<Bob.HttpResponse>(
    Bob.api.$http.post({
      url: `https://${getBaseApi()}/translate_a/single?${querystring.stringify(data)}`,
      timeout,
      header: {
        'User-Agent': userAgent,
      },
      body: { q: text },
    }),
  );
  if (res?.response.statusCode === 429) {
    apiLimitErrorTime = Date.now();
    throw Bob.util.error('api', '接口请求频率过快', err);
  }

  if (err) throw Bob.util.error('network', '接口网络错误', err);

  const resData = res?.data;
  Bob.api.$log.info(JSON.stringify(res));
  if (!Bob.util.isArray(resData)) throw Bob.util.error('api', '接口返回数据出错', res);

  const result: Bob.Result = { from: noStandardToStandard(from), to: noStandardToStandard(to), toParagraphs: [] };

  try {
    const [paragraphs, dict] = resData;
    if (Bob.util.isArrayAndLenGt(paragraphs, 1)) {
      let _paragraphs = '';
      let _fromParagraphs = '';
      paragraphs.slice(0, -1).forEach((_paragraph: string[]) => {
        if (!Bob.util.isArrayAndLenGt(_paragraph, 1)) return;
        const [targetStr, sourceStr] = _paragraph;
        if (Bob.util.isString(targetStr)) _paragraphs += targetStr;
        if (Bob.util.isString(sourceStr)) _fromParagraphs += sourceStr;
      });
      result.toParagraphs = _paragraphs.split('\n');
      result.fromParagraphs = _fromParagraphs.split('\n');
    }
    if (Bob.util.isArrayAndLenGt(dict, 0)) {
      result.toDict = { parts: [], phonetics: [] };
      const parts = dict
        .filter((item: Bob.PartObject) => Bob.util.isArrayAndLenGt(item, 0))
        .map(([part, means]: [string, string[]]) => Bob.util.isArrayAndLenGt(means, 0) && { part, means })
        .filter((item: Bob.PartObject) => !!item);
      if (Bob.util.isArrayAndLenGt(parts, 0)) result.toDict.parts = parts;
      const ttsUrl = tts(text, { from: lang || from });
      result.fromTTS = { type: 'url', value: ttsUrl };
      result.toDict.phonetics = [{ type: 'us', value: '发音', tts: { type: 'url', value: ttsUrl, raw: {} } }];
    }
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
