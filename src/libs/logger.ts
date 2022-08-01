import * as winston from 'winston'

/**
 * Create a logger instance to write log messages in JSON format.
 *
 * @param requestId - a tracing id to be added to all log messages to trace the request from call to response
 */
export function createLogger(requestId: string, layer: string, method: string) {
  return winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    defaultMeta: { requestId, layer, method },
    transports: [
      new winston.transports.Console()
    ]
  })
}