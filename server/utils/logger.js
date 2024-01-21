const { createLogger, format, transports } = require('winston');
const util = require('util');
const path = require('path');


const { combine, printf, colorize, errors } = format;

// Validate message
const validateMessage = format((info) => {
  if (typeof info.message !== 'string') {
    info.message = JSON.stringify(info.message);
  }
  return info;
});

// Ignore log messages if they have { private: true }
const ignorePrivate = format((info) => {
  if (info.private) return false;
  return info;
});

// Hide sensitive information
const hideSensitive = format((info) => {
  info.message = info.message.replace(/:\w+@/, ':***@');
  return info;
});

const logger = createLogger({
  level: 'debug',
  format: combine(
    errors({ stack: true }),
    validateMessage(),
    ignorePrivate(),
    hideSensitive(),
    format.timestamp(),
    printf((msg) => {
      const { level, timestamp, message, ...meta } = msg;
      const data = { message, ...meta };
      let isCircularStructure = false;

      try {
        JSON.stringify(data);
      } catch (error) {
        if (error.message.match('Converting circular structure to JSON')) {
          isCircularStructure = true;
        }
      }

      const formattedData = isCircularStructure
        ? util.inspect(data)
        : JSON.stringify(data);

      // eslint-disable-next-line prettier/prettier
      return colorize().colorize(level, `[${timestamp}] \x1b[1m[${level}]\x1b[0m ${formattedData}`);
    }),
  ),
  transports: [new transports.Console()],
});

if (process.env.NODE_ENV == 'production') {
  logger.clear().add(
    new transports.Console({
      format: combine(
        errors({ stack: true }),
        validateMessage(),
        ignorePrivate(),
        hideSensitive(),
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSSZ' }),
        printf((msg) => {
          const { timestamp, level, message, product, service, module, requestID, stack, details, ...meta } = msg;
          const metadata = Object.keys(meta).length ? `${JSON.stringify(meta)}` : '';
          const moduleName = module ? `${module.toString().padStart(12)}`: `${'-'.repeat(20)}`;
          const request_ID = requestID ? `[${requestID.toString()}]`:`${''}`;
          const httpContext = details && details.url && details.statusCode ? `"\x1b[3m${details.toString()} /${details.url.toString()}\x1b[0m - ${details.statusCode}"`:'';

          if (stack) {
            const formattedStack = stack.split('\n').map((line) => colorize().colorize(level, line)).join('\n\t\t\t\t');
            const productService = product && service ? `[${product.toString().padStart(10)} : \x1b[33m${service.toString().padStart(10)}\x1b[0m]`: `${'-'.repeat(20)}`;

            return colorize().colorize(level, `[${timestamp}] \x1b[1m[${level.padStart(5).toUpperCase()}]\x1b[0m ${productService} [${moduleName}] ${request_ID} ${httpContext} : ${message} ${metadata} \n\t\t\t\t ${formattedStack}`);
          } else {
            const productService = product && service ? `[${product.toString().padStart(10)} : \x1b[35m${service.toString().padStart(10)}\x1b[0m]`: `${'-'.repeat(20)}`;
            return colorize().colorize(level, `[${timestamp}] \x1b[1m[${level.padStart(5).toUpperCase()}] \x1b[0m ${productService} [${moduleName}] ${request_ID} ${httpContext} : ${message} ${metadata}`);
          }
          }),
      ),
    }),
    logger.clear().add(
    new transports.File({
      filename: path.join(__dirname, '..', '/log/errors.log'),
      format: combine(
        errors({ stack: true }),
        validateMessage(),
        ignorePrivate(),
        hideSensitive(),
        format.timestamp(),
        printf((msg) => {
          const { level, timestamp, message, ...meta } = msg;
          const data = { timestamp, level, message, ...meta };
          let isCircularStructure = false;
    
          try {
            JSON.stringify(data);
          } catch (error) {
            if (error.message.match('Converting circular structure to JSON')) {
              isCircularStructure = true;
            }
          }
    
          const formattedData = isCircularStructure
            ? util.inspect(data)
            : JSON.stringify(data);
    
          // eslint-disable-next-line prettier/prettier
          return `${formattedData}`;
        }),
      ),
      transports: [new transports.Console()],
    })
  )
  );
}


if (process.env.NODE_ENV !== 'production') {
  logger.clear().add(
    new transports.Console({
      format: combine(
        errors({ stack: true }),
        validateMessage(),
        ignorePrivate(),
        hideSensitive(),
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSSZ' }),
        printf((msg) => {
          const { timestamp, level, message, product, service, module, requestID, stack, details, ...meta } = msg;
          const metadata = Object.keys(meta).length ? `${JSON.stringify(meta)}` : '';
          const moduleName = module ? `${module.toString().padStart(12)}`: `${'-'.repeat(20)}`;
          const request_ID = requestID ? `[${requestID.toString()}]`:`${''}`;
          const httpContext = details && details.url && details.statusCode ? `"\x1b[3m${details.toString()} /${details.url.toString()}\x1b[0m - ${details.statusCode}"`:'';

          if (stack) {
            const formattedStack = stack.split('\n').map((line) => colorize().colorize(level, line)).join('\n\t\t\t\t');
            const productService = product && service ? `[${product.toString().padStart(10)} : \x1b[33m${service.toString().padStart(10)}\x1b[0m]`: `${'-'.repeat(20)}`;

            return colorize().colorize(level, `[${timestamp}] \x1b[1m[${level.padStart(5).toUpperCase()}]\x1b[0m ${productService} [${moduleName}] ${request_ID} ${httpContext} : ${message} ${metadata} \n\t\t\t\t ${formattedStack}`);
          } else {
            const productService = product && service ? `[${product.toString().padStart(10)} : \x1b[35m${service.toString().padStart(10)}\x1b[0m]`: `${'-'.repeat(20)}`;
            return colorize().colorize(level, `[${timestamp}] \x1b[1m[${level.padStart(5).toUpperCase()}] \x1b[0m ${productService} [${moduleName}] ${request_ID} ${httpContext} : ${message} ${metadata}`);
          }
          }),
      ),
    }),
    logger.clear().add(
    new transports.File({
      filename: path.join(__dirname, '..', '/log/errors.log'), //đường dẫn đến tập tin lưu log.
      format: combine(
        errors({ stack: true }),                               //thu thập stack các mục log lỗi.
        validateMessage(),                                     //kiểm tra tính hợp lệ của log.
        ignorePrivate(),                                       //Bỏ qua các thuộc tính riêng tư
        hideSensitive(),                                       //Ẩn thông tin nhạy cảm.
        format.timestamp(),                                    //thêm thời gian vào các mục log.
        printf((msg) => {                                      //định dạng thông điệp log
          const { level, timestamp, message, ...meta } = msg;
          const data = { timestamp, level, message, ...meta };
          let isCircularStructure = false;
          try {
            JSON.stringify(data);
          } catch (error) {
            if (error.message.match('Converting circular structure to JSON')) {
              isCircularStructure = true;
            }
          }
          const formattedData = isCircularStructure
            ? util.inspect(data)
            : JSON.stringify(data);
          return `${formattedData}`;                           //chuyển đổi log thành chuỗi JSON
        }),
      ),
      transports: [new transports.Console()],                  //log đồng thời xuất hiện trên console
    })
  )
  );
}

module.exports = logger;
