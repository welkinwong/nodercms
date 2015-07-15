module.exports = {
  appenders: [
    {
      type: 'console'
    },
    {
      type: 'dateFile',
      category: 'access',
      filename: 'logs/access/access',
      pattern: '-yyyy-MM-dd.log'
    },
    {
      type: 'dateFile',
      category: 'system',
      filename: 'logs/system/system',
      pattern: '-yyyy-MM-dd.log'
    },
    {
      type: 'dateFile',
      category: 'admin',
      filename: 'logs/admin/admin',
      pattern: '-yyyy-MM-dd.log'
    },
    {
      type: 'logLevelFilter',
      level: 'ERROR',
      appender: {
        type: 'file', 
        filename: 'logs/errors',
        pattern: '-yyyy-MM-dd.log'
      }
    }
  ],
  replaceConsole: true
};