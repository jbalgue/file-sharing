import restify from 'restify';
import dotenv from 'dotenv';
import Routes from './routes';
import CronJobUtil from './util/cronJobUtil';
import fileUtil from './util/fileUtil';

// Initialize environment variables placed in .env file
dotenv.config();

const server = restify.createServer({
  maxParamLength: 1024,
});

server.use(
  restify.plugins.multipartBodyParser({
    multiples: true,
  }),
);

server.on('uncaughtException', (req, res, route, err) => {
  console.log();
  console.log(route);
  console.log();
  console.log(err);
  console.log();
});

// Initialize cron job
// eslint-disable-next-line no-new
new CronJobUtil(fileUtil);

// Initialize routes
Routes(server);

export default server;
