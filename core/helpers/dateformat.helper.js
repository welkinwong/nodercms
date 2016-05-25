var moment = require('moment');
moment.locale('zh-cn');

module.exports = function (context, options) {
  if (!options && context.hasOwnProperty('hash')) {
    options = context;
    context = undefined;

    // set to published_at by default, if it's available
    // otherwise, this will print the current date
    if (this.published_at) context = this.published_at;
  }

  // ensure that context is undefined, not null, as that can cause errors
  context = context === null ? undefined : context;

  var format = options.hash.format || 'YYYY年MM月DD日';
  var timeago = options.hash.timeago;
  var date;

  if (timeago) {
    date = moment(context).fromNow();
  } else {
    date = moment(context).format(format);
  }

  return date;
};