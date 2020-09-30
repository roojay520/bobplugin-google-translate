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

  _input = decamelize(_input);
  _input = _input
    .replace(/[_-]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
  _input = `${_input.charAt(0).toUpperCase()}${_input.slice(1)}`;

  return _input;
};

module.exports = humanizeString;
