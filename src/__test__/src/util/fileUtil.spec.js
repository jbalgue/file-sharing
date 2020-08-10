import fileUtil from '../../../util/fileUtil';

describe('fileUtil', () => {
  it('should have the correct properties', () => {
    expect(fileUtil).toHaveProperty('checkIfFileExist');
  });
});
