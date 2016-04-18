module.exports = {
  appenders: [
    {
      type: 'console'
    },
    {
      type: 'dateFile',
      category: 'access',
      filename: 'logs/access/access',
      pattern: '-dd--hh.log',
      alwaysIncludePattern: true
    },
    {
      type: 'dateFile',
      category: 'system',
      filename: 'logs/system/system',
      pattern: '-dd.log',
      alwaysIncludePattern: true
    },
    {
      type: 'dateFile',
      category: 'database',
      filename: 'logs/database/database',
      pattern: '-dd.log',
      alwaysIncludePattern: true
    },
    {
      type: 'logLevelFilter',
      level: 'ERROR',
      appender: {
        type: 'dateFile',
        filename: 'logs/errors/error',
        pattern: '-MM-dd.log',
        alwaysIncludePattern: true
      }
    }
  ],
  replaceConsole: true
};