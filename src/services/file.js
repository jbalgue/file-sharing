import { generateKeyPairSync, createPublicKey } from 'crypto';
import AdmZip from 'adm-zip';
import { encodeKeysToBase64, decodeKeyFromBase64 } from '../util/stringUtil';
import handle from '../util/promiseUtil';

// Enforcing this to be private
const generateKeys = () => {
  const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 512,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });

  const publicKeyStr = publicKey
    .replace(/\n|-----BEGIN PUBLIC KEY-----|-----END PUBLIC KEY-----/gi, '');
  const privateKeyStr = privateKey
    .replace(/\n|-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----/gi, '');

  return {
    publicKey: publicKeyStr,
    privateKey: privateKeyStr,
  };
};

export default class FileService {
  constructor(fileUtil) {
    this.fileUtil = fileUtil;
  }

  async uploadFiles(fileList) {
    const fu = this.fileUtil;
    const fileParamNames = Object.keys(fileList);

    // Place all file objects into single list
    const files = [];
    for (let i = 0; fileParamNames.length > i; i += 1) {
      const file = fileList[fileParamNames[i]];
      if (Array.isArray(file)) {
        files.push(...file);
      } else {
        files.push(file);
      }
    }

    const { publicKey, privateKey } = generateKeys();
    const [err] = await handle(fu.createFileEntry(files,
      { parentDirName: encodeURIComponent(publicKey) }));

    if (err) {
      throw err;
    }

    // encodeKeysToBase64 - just to make things URL friendly
    return encodeKeysToBase64({ publicKey, privateKey });
  }

  /**
   * Compresses all files into zip files
   * @param {*} parentDirName
   * @returns Zip Buffer
   */
  async getFiles(parentDirName) {
    const fu = this.fileUtil;
    const [err, files] = await handle(fu
      .getFiles(encodeURIComponent(decodeKeyFromBase64(parentDirName))));

    if (err) {
      throw err;
    }

    // Add files to zip object
    const zip = new AdmZip();
    for (let i = 0; files.length > i; i += 1) {
      zip.addFile(files[i].fileName, files[i].content);
    }

    return zip.toBuffer();
  }

  async deleteDir(parentDirName) {
    const fu = this.fileUtil;
    const privateKeyDecoded = `-----BEGIN PRIVATE KEY-----\n${decodeKeyFromBase64(parentDirName)}\n-----END PRIVATE KEY-----`;

    const publicKey = createPublicKey({
      key: privateKeyDecoded,
    });

    const dirName = publicKey.export({ type: 'spki', format: 'pem' })
      .replace(/\n|-----BEGIN PUBLIC KEY-----|-----END PUBLIC KEY-----/gi, '');

    const delDir = await fu.deleteDir(encodeURIComponent(dirName));
    return delDir;
  }
}
