import fileUtil from '../../../../util/fileUtil';

// Some tests...
describe('fileUtil', () => {
  it('should have the correct properties', () => {
    expect(fileUtil).toHaveProperty('checkIfFileExist');
    expect(fileUtil).toHaveProperty('createFileEntry');
    expect(fileUtil).toHaveProperty('getFiles');
    expect(fileUtil).toHaveProperty('deleteDir');
    expect(fileUtil).toHaveProperty('fileCleaner');
  });
});
