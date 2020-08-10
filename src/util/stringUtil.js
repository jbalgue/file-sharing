const encodeKeysToBase64 = ({ publicKey, privateKey }) => ({
  publicKey: Buffer.from(publicKey).toString('base64'),
  privateKey: Buffer.from(privateKey).toString('base64'),
});

const decodeKeyFromBase64 = (key) => (Buffer.from(key, 'base64').toString('utf-8'));

export {
  encodeKeysToBase64,
  decodeKeyFromBase64,
};
