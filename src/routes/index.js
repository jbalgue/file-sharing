import FileController from '../controller/file';
import verifyRequest from '../util/accessUtil';
import handle from '../util/promiseUtil';

const verifyRequestHandler = async (req, res, next) => {
  // Sliding logs, custom handling of requests.
  const { remoteAddress } = req.connection;
  const [err] = await handle(verifyRequest(remoteAddress, req.getRoute().name));
  if (err) {
    res.send(err);
    return next(false);
  }
  return next();
};

const Routes = (server) => {
  server.post('/files', verifyRequestHandler, FileController.uploadFiles);
  server.get('/files/:publicKey', verifyRequestHandler, FileController.getFiles);
  server.del('/files/:privateKey', FileController.deleteFiles);
};
export default Routes;
