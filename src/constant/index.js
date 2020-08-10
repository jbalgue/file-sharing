import { homedir } from 'os';
import { join } from 'path';

// If FOLDER is not availble in the env variable,
// sets to default dir.
export const ROOT_FOLDER = () => (process.env.FOLDER || join(homedir(), 'file-sharing-root'));
export const LOGGER_FILENAME = () => (process.env.LOGGER_FILENAME || 'logger-temp');
export const LAPSE_TIME_MILLIS = () => (process.env.LAPSE_TIME_MILLIS || 60000);

export const DS_STORE_FILENAME = '.DS_Store';
export const ACCESS_LOG_FILENAME = 'access_log';
export const ROUTE_NAME = {
  upload: 'postfiles',
  download: 'getfilespublickey',
};
export const MAX_REQUEST = {
  upload: 2,
  download: 2,
};
