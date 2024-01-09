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


// if (process.env.NODE_ENV == 'production') {
//   logger.clear().add(
//     new transports.Console({
//       format: combine(
//         errors({ stack: true }),
//         validateMessage(),
//         ignorePrivate(),
//         hideSensitive(),
//         format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSSZ' }),
//         printf((msg) => {
//           const { level, timestamp, message, stack, ...meta } = msg;
//           // eslint-disable-next-line prettier/prettier
//           const context = msg.ctx ? `[${msg.ctx.toString().padStart(20)}]`: `[${'-'.repeat(20)}]`;
//           delete meta.ctx;
//           // eslint-disable-next-line prettier/prettier
//           const metadata = Object.keys(meta).length ? `${JSON.stringify(meta)}` : '';

//           // console.log(msg);
//           if (stack) {
//             // eslint-disable-next-line prettier/prettier
//             const productService = meta.product && meta.service ? `[${meta.product.toString()} : \x1b[33m${meta.service.toString()}\x1b[0m]`: `${'-'.repeat(20)}`;
//             return colorize().colorize(level, `[${timestamp}] \x1b[1m[${level.padStart(5).toUpperCase()}]\x1b[0m ${productService} ${context} ${message} ${metadata} \n\t\t\t\t${stack.replace(/\n/g, "\n\t\t\t\t")}`);
//           } else {
//           // eslint-disable-next-line prettier/prettier
//           const productService = meta.product && meta.service ? `[${meta.product.toString()} : \x1b[35m${meta.service.toString()}\x1b[0m]`: `${'-'.repeat(20)}`;
//             return colorize().colorize(level, `[${timestamp}] \x1b[1m[${level.padStart(5).toUpperCase()}]\x1b[0m ${productService} ${context} ${message} ${metadata}`);
//           }
//           }),
//       ),
//     }),
//     logger.clear().add(
//     new transports.File({
//       filename: path.join(__dirname, '..', '/log/errors.log'),
//       format: combine(
//         errors({ stack: true }),
//         validateMessage(),
//         ignorePrivate(),
//         hideSensitive(),
//         format.timestamp(),
//         printf((msg) => {
//           const { level, timestamp, message, ...meta } = msg;
//           const data = { message, ...meta };
//           let isCircularStructure = false;
    
//           try {
//             JSON.stringify(data);
//           } catch (error) {
//             if (error.message.match('Converting circular structure to JSON')) {
//               isCircularStructure = true;
//             }
//           }
    
//           const formattedData = isCircularStructure
//             ? util.inspect(data)
//             : JSON.stringify(data);
    
//           // eslint-disable-next-line prettier/prettier
//           return `${timestamp} ${level.toUpperCase()} ${msg.ctx || ''}${formattedData}`;
//         }),
//       ),
//       transports: [new transports.Console()],
//     })
//   ));
// }




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
          const httpContext = details.requestType && details.url && details.statusCode ? `"\x1b[3m${details.requestType.toString()} /${details.url.toString()}\x1b[0m - ${details.statusCode}"`:'';

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
          return `${timestamp} ${level.toUpperCase()} ${msg.ctx || ''}${formattedData}
`;
        }),
      ),
      transports: [new transports.Console()],
    })
  ));
}

module.exports = logger;
