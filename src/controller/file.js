import errors from 'restify-errors';
import fileUtil from '../util/fileUtil';
import FileService from '../services/file';
import handle from '../util/promiseUtil';

export default class FileController {
  static async uploadFiles(req, res, next) {
    const fileList = req.files;

    // Can pass other fileUtil implementations,
    // eg. AWSFileUtil, GCPUtil to handle files
    const fileService = new FileService(fileUtil);
    const [err, keys] = await handle(fileService.uploadFiles(fileList));

    // Return error if no keys were generated
    if (err) {
      res.send(new errors.InternalError('something went wrong'));
      return next();
    }

    // Return public and private keys
    res.send(keys);
    return next();
  }

  static async getFiles(req, res, next) {
    console.log(req.connection.remoteAddress);
    const { publicKey } = req.params;

    const fileService = new FileService(fileUtil);
    const [err, zipBuff] = await handle(fileService.getFiles(publicKey));

    // Handle not found files
    if (err) {
      res.send(new errors.BadRequestError(err.message));
      return next();
    }

    // Set headers
    res.header('Content-Length', zipBuff.length);
    res.header('Content-Type', 'application/octet-stream');
    res.header('Content-Disposition', 'attachment; filename=Files.zip');

    res.send(zipBuff);
    return next();
  }

  static async deleteFiles(req, res, next) {
    const { privateKey } = req.params;
    const fileService = new FileService(fileUtil);
    const [err, isDeleted] = await handle(fileService.deleteDir(privateKey));

    if (err || !isDeleted) {
      console.log(err);
      res.send(new errors.InternalError('something went wrong'));
      return next();
    }

    res.send({ message: 'Success' });
    return next();
  }
}
