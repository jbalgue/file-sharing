import errors from 'restify-errors';
import { promises as fsPromise } from 'fs';
import { join } from 'path';
import handle from './promiseUtil';
import {
  ROOT_FOLDER,
  ACCESS_LOG_FILENAME,
  ROUTE_NAME, MAX_REQUEST,
} from '../constant';

// Creates new access_log entry
const NEW_LOG_ENTRY = (routeName) => ({
  lastRequest: new Date(),
  uploads: routeName === ROUTE_NAME.upload ? 1 : 0,
  downloads: routeName === ROUTE_NAME.download ? 1 : 0,
});

/**
 * Basically limits the upload and download requests,
 * based on access_log file.
 * Storing them currently on file
 * @param {*} remoteAddress ip of the request
 * @param {*} routeName name of the route being accessed
 * @returns {Promise}
 */
const verifyRequest = async (remoteAddress, routeName) => {
  const loggerFile = join(ROOT_FOLDER(), ACCESS_LOG_FILENAME);

  // Read access_log file
  const [err, logStr] = await handle(fsPromise.readFile(loggerFile));
  const logs = logStr ? JSON.parse(logStr) : {};

  // Get log per ip
  const log = logs[remoteAddress];
  if (!err && log) {
    const currentDate = new Date();
    const currDayMonthYear = `${currentDate.getDate()}-${currentDate.getMonth()}-${currentDate.getFullYear()}`;

    // Compare dates from previous access
    const lastReqDate = new Date(log.lastRequest);
    const lastReqDayMonthYear = `${lastReqDate.getDate()}-${lastReqDate.getMonth()}-${lastReqDate.getFullYear()}`;
    if (currDayMonthYear === lastReqDayMonthYear) {
      // Check if request exceeded based on route name
      if (routeName === ROUTE_NAME.upload) {
        if (log.uploads === MAX_REQUEST.upload) {
          throw new errors.TooManyRequestsError('upload request exceeded');
        }

        // Update count
        log.uploads += 1;
      }

      if (routeName === ROUTE_NAME.download) {
        if (log.downloads === MAX_REQUEST.download) {
          throw new errors.TooManyRequestsError('download request exceeded');
        }

        // Update count
        log.downloads += 1;
      }
      // Update log
      logs[remoteAddress] = log;
    } else {
      // Delete old entry, if any
      delete logs[remoteAddress];

      // New entry
      logs[remoteAddress] = NEW_LOG_ENTRY(routeName);
    }
  } else {
    // New entry
    console.log('new entry');
    logs[remoteAddress] = NEW_LOG_ENTRY(routeName);
  }

  console.log(remoteAddress, ' | remoteAddress log ->\n', logs[remoteAddress]);

  // Update access_log file
  fsPromise.writeFile(join(ROOT_FOLDER(), ACCESS_LOG_FILENAME), JSON.stringify(logs));
};

export default verifyRequest;
