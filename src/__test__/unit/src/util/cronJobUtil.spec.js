import CronJobUtil from '../../../../util/cronJobUtil';

// Some tests...
jest.mock('node-cron', () => ({
  schedule: jest.fn(),
}));

describe('cronJobUtil', () => {
  it('should have the correct properties', () => {
    const job = new CronJobUtil({});
    expect(job).toHaveProperty('initFileCleanerJob');
  });
});
