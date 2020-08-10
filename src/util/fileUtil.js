import { promises as fsPromise } from 'fs';
import { join } from 'path';
import {
  ROOT_FOLDER,
  LOGGER_FILENAME,
  LAPSE_TIME_MILLIS,
  ACCESS_LOG_FILENAME,
  DS_STORE_FILENAME,
} from '../constant/index';

const LOGGER = {
  createLogger: (parentDir) => {
    const log = {
      created: Date.now(),
    };
    fsPromise.writeFile(join(parentDir, LOGGER_FILENAME()), JSON.stringify(log));
  },
  updateLastAccess: async (parentDir) => {
    const loggerFile = join(parentDir, LOGGER_FILENAME());
    const logStr = await fsPromise.readFile(loggerFile);

    const log = JSON.parse(logStr);
    log.lastAccessed = Date.now();
    console.log(log);
    fsPromise.writeFile(loggerFile, JSON.stringify(log));
  },
};

export default class FileUtil {
  static async checkIfFileExist(dir) {
    return fsPromise.stat(dir).then(() => true).catch(() => false);
  }

  static async createFileEntry(files, { parentDirName }) {
    // Check if root dir exists
    const isRootExist = await this.checkIfFileExist(ROOT_FOLDER());
    if (!isRootExist) {
      // Create root dir
      const isRootDirCreated = await fsPromise.mkdir(ROOT_FOLDER())
        .then(() => true).catch(() => false);

      if (!isRootDirCreated) {
        const errMsg = 'root dir not created';
        throw new Error(errMsg);
      }
    }

    // Upload new file
    const fileAbsoluteDir = join(ROOT_FOLDER(), parentDirName);
    const alreadyExist = await this.checkIfFileExist(fileAbsoluteDir);
    if (!alreadyExist) {
      // Create the parent dir
      const isFileAbsoluteDir = await fsPromise
        .mkdir(fileAbsoluteDir).then(() => true).catch(() => false);
      if (!isFileAbsoluteDir) {
        throw new Error('file dir not created');
      }
    }

    files.forEach((file) => {
      const f = join(fileAbsoluteDir, file.name);
      fsPromise.rename(file.path, f, (err) => {
        console.log(`${file.name} not uploaded | ${err}`);
        throw err;
      });
    });

    LOGGER.createLogger(fileAbsoluteDir);
  }

  static async getFiles(parentDirName) {
    const parentDir = join(ROOT_FOLDER(), parentDirName);

    const isParentDirExist = await this.checkIfFileExist(parentDir);
    if (!isParentDirExist) {
      throw new Error('file does not exist');
    }

    // Read all file names from dir
    const fileNames = await fsPromise.readdir(parentDir);

    // Remove logger file from the list to prevent returning it
    fileNames.splice(fileNames.findIndex((val) => val === LOGGER.loggerName), 1);

    // Read all files and place them in an list of object
    const files = () => Promise.all(fileNames.map((fileName) => (
      fsPromise.readFile(join(parentDir, fileName))
        .then((content) => (
          {
            fileName,
            content,
          }
        ))
    )));

    // // Update log
    LOGGER.updateLastAccess(parentDir);

    // Return files when all are resolved
    return files().then((data) => data);
  }

  static async deleteDir(parentDirName) {
    const parentDir = join(ROOT_FOLDER(), parentDirName);
    const deleteParentDir = await fsPromise
      .rmdir(parentDir, { recursive: true }).then(() => true).catch(() => false);
    return deleteParentDir;
  }

  static async fileCleaner() {
    const parentDirs = await fsPromise.readdir(ROOT_FOLDER());

    // Exclude unnecessary files
    const toIgnore = [DS_STORE_FILENAME, ACCESS_LOG_FILENAME];
    const parentDirsClean = parentDirs.filter((dir) => !toIgnore.includes(dir));

    // Check all logger files
    parentDirsClean.forEach(async (dir) => {
      const logStr = await fsPromise.readFile(join(ROOT_FOLDER(), dir, LOGGER_FILENAME()));

      const log = JSON.parse(logStr);
      const lapseTime = Date.now() - (log.lastAccessed || log.created);
      // Delete files if lapse
      if (lapseTime >= LAPSE_TIME_MILLIS()) {
        console.log('To delete | ', join(ROOT_FOLDER(), dir));
        this.deleteDir(dir);
      }
    });
  }
}
