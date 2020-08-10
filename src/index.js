import restify from 'restify';
import dotenv from 'dotenv';
import Routes from './routes';
import CronJobUtil from './util/cronJobUtil';
import fileUtil from './util/fileUtil';

// Initialize environment variables placed in .env file
dotenv.config();

// If PORT is not availble in the env variable,
// sets to default port.
const SERVER_CONF = {
  host: '0.0.0.0',
  port: process.env.PORT || 9091,
};

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

// Start server
server.listen(SERVER_CONF.port, SERVER_CONF.host, () => {
  console.log();
  console.log('*********************************');
  console.log(`Running on http://${SERVER_CONF.host}:${SERVER_CONF.port}`);
  console.log('*********************************');
  console.log();
});
