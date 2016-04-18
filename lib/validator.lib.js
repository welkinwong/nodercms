var _ = require('lodash');
var validator = require('validator');
var expressValidator = require('express-validator');

/**
 * 自定义验证
 */
module.exports = function () {
  return expressValidator({
    errorFormatter: function (param, message, value) {
      return {
        param: param,
        message: message,
        value: value
      };
    },
    customValidators: {
      isString: function (value) { return _.isString(value) },
      isEmail: function (value) { return /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(value) },
      isNumber: function (value) { return _.isNumber(value) },
      isObject: function (value) { return _.isObject(value) },
      isArray: function (value) { return _.isArray(value) },
      inArray: function (param) {
        var argumentsArray = [].slice.apply(arguments);
        var validatorName = argumentsArray[1];

        return _.every(param, function (item) {
          var validatorOptions = _.tail(argumentsArray);
          validatorOptions.unshift(item);

          switch(validatorOptions[1]) {
            case 'isString': return _.isString(item); break;
            case 'isEmail': return /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(value); break;
            case 'isNumber': return _.isNumber(item); break;
            case 'isObject': return _.isObject(item); break;
            case 'isArray': return _.isArray(item); break;
            case 'isBoolean':
              switch (typeof value) {
                case 'string': return value === 'true' || value === 'false'; break;
                case 'boolean': return value === true || value === false; break;
                default: return false;
              }
              break;
            default:
              return validator[validatorName].apply(this, validatorOptions);
          }
        });
      },
      isBoolean: function (value) {
        switch (typeof value) {
          case 'string':
            return value === 'true' || value === 'false';
            break;
          case 'boolean':
            return value === true || value === false;
            break;
          default:
            return false;
        }
      },
      custom: function (value, callback) {
        if (typeof value !== 'undefined') {
          return callback(value);
        } else {
          return false;
        }
      }
    }
  });
};