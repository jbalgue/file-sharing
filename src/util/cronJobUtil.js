import cron from 'node-cron';

export default class CronJobUtil {
  constructor(fileUtil) {
    this.fileUtil = fileUtil;

    this.initFileCleanerJob();
  }

  initFileCleanerJob() {
    cron.schedule('* * * * *', async () => {
      console.log('running fileCleanerJob');

      this.fileUtil.fileCleaner();
    });
  }
}
