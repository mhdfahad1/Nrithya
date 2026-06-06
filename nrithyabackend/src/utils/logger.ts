import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'white',
  debug: 'magenta',
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

let transport = new DailyRotateFile({
  filename: 'logs/application-%DATE%.log',
  datePattern: 'YYYY-MM-DD-HH',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d'
});

transport.on('rotate', function (oldFilename, newFilename) {
  // do something fun
});

const transports = [
  new winston.transports.Console(),
  new DailyRotateFile({
    filename: 'logs/error-%DATE%.log',
    level: 'error'
  }),
  new DailyRotateFile({
    filename: 'logs/all-%DATE%.log'
  })
];

const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports
});

export default logger;
