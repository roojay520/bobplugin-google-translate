// https://github.com/sindresorhus/humanize-string

var decamelize = (text, separator = '_') => {
  if (!(typeof text === 'string' && typeof separator === 'string')) {
    throw new TypeError('The `text` and `separator` arguments should be of type `string`');
  }
  return text
    .replace(/([\p{Lowercase_Letter}\d])(\p{Uppercase_Letter})/gu, `$1${separator}$2`)
    .replace(/(\p{Uppercase_Letter}+)(\p{Uppercase_Letter}\p{Lowercase_Letter}+)/gu, `$1${separator}$2`);
};

var humanizeString = (input) => {
  let _input = input;
  if (typeof _input !== 'string') {
    throw new TypeError('Expected a string');
  }
  _input = decamelize(_input, '');
  _input = _input
    .replace(/[]+/g, ' ')
    .replace(/([_-])+/g, ' $1 ')
    // https://stackoverflow.com/questions/3469080/match-whitespace-but-not-newlines#answer-3469155:~:text=Use%20a%20double%2Dnegative
    .replace(/[^\S\r\n]{2,}/g, ' ')
    .trim();
  _input = `${_input.charAt(0).toUpperCase()}${_input.slice(1)}`;

  // https://github.com/roojay520/bobplugin-google-translate/issues/2
  if (!_input.includes(' ')) return _input.toLowerCase();

  return _input;
};

module.exports = humanizeString;
