module.exports = {
  appenders: [
    {
      type: 'console'
    },
    {
      type: 'dateFile',
      category: 'access',
      filename: 'logs/access/access',
      pattern: '-yyyy-MM-dd.log',
      alwaysIncludePattern: true
    },
    {
      type: 'dateFile',
      category: 'system',
      filename: 'logs/system/system',
      pattern: '-yyyy-MM-dd.log',
      alwaysIncludePattern: true
    },
    {
      type: 'dateFile',
      category: 'database',
      filename: 'logs/database/database',
      pattern: '-yyyy-MM-dd.log',
      alwaysIncludePattern: true
    },
    {
      type: 'dateFile',
      category: 'admin',
      filename: 'logs/admin/admin',
      pattern: '-yyyy-MM-dd.log',
      alwaysIncludePattern: true
    },
    {
      type: 'logLevelFilter',
      level: 'ERROR',
      appender: {
        type: 'dateFile',
        filename: 'logs/errors/error',
        pattern: '-yyyy-MM-dd.log',
        alwaysIncludePattern: true
      }
    }
  ],
  replaceConsole: true
};