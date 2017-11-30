const { createLogger, format, transports } = require('winston')
const { combine, timestamp, printf } = format

const myFormat = printf(info => {
  return `${info.timestamp} [${info.level}]: ${info.message}`
})

const logger = createLogger({
  format: combine(
    format.colorize({ label: true }),
    timestamp(),
    myFormat
  ),
  transports: [new transports.Console({
    level: process.env.DEBUG_LEVEL || 'info', // app.settings.logLevel, // TODO should use the config
    colorize: true
  })]
})

/* eslint no-useless-call: 0 */
console.log = (...args) => { args[0] === undefined ? logger.info.call(logger, 'undefined') : logger.info.call(logger, ...args) }
console.info = (...args) => { args[0] === undefined ? logger.info.call(logger, 'undefined') : logger.info.call(logger, ...args) }
console.warn = (...args) => { args[0] === undefined ? logger.warn.call(logger, 'undefined') : logger.warn.call(logger, ...args) }
console.error = (...args) => { args[0] === undefined ? logger.error.call(logger, 'undefined') : logger.error.call(logger, ...args) }
console.debug = (...args) => { args[0] === undefined ? logger.debug.call(logger, 'undefined') : logger.debug.call(logger, ...args) }

module.exports = () => {
}
