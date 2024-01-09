import { child } from 'winston';

const childLogger = child({
  time: new Date().toISOString(),
  env: process.env.NODE_ENV || 'development',
/////////////////
  product: process.env.PRODUCT || 'BKnews',
//  service: process.env.NODE_SERVICE || 'CallAPI',
/////////////////
});

export default childLogger;
