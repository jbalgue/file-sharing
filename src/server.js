import app from './app';

// If PORT is not availble in the env variable,
// sets to default port.
const SERVER_CONF = {
  host: '0.0.0.0',
  port: process.env.PORT || 9091,
};

// Start server
app.listen(SERVER_CONF.port, SERVER_CONF.host, () => {
  console.log();
  console.log('*********************************');
  console.log(`Running on http://${SERVER_CONF.host}:${SERVER_CONF.port}`);
  console.log('*********************************');
  console.log();
});
