import * as bodyParser from 'body-parser';
import { LogLevel, Logger } from 'channelape-logger';
import { ChannelApeClient } from 'channelape-sdk';
import * as compression from 'compression';
import * as express from 'express';
import * as fs from 'fs';
import * as os from 'os';
import OrdersController from './channelape/orders/controller/OrdersController';
import Secrets from './channelape/util/Secrets';

const logger = new Logger('Index', Secrets.env.LOG_LEVEL);
handleErrors();
Secrets.validateEnvars();
const channelApeClient = new ChannelApeClient({
  sessionId: Secrets.env.CHANNEL_APE_SECRET_KEY,
  endpoint: Secrets.env.CHANNEL_APE_API_DOMAIN_NAME,
  timeout: 300000,
  maximumRequestRetryTimeout: 600000,
  logLevel: LogLevel.WARN
});
const ordersController = new OrdersController(channelApeClient);
initServer();

function handleErrors() {
  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    const promiseStr = JSON.stringify(promise);
    const reasonStr = JSON.stringify(reason);
    logger.error(`process terminating due to unhandled rejection at: ${promiseStr}, reason: ${reasonStr}`);
    process.exit(1);
  });

  process.on('uncaughtException', (err: Error) => {
    logger.error(`process terminating due to uncaught exception: ${err}`);
    process.exit(1);
  });
}

function initServer() {
  const app = express();
  const packageJson = JSON.parse(fs.readFileSync('package.json').toString());
  const port = Secrets.env.PORT;
  app.use(bodyParser.json());
  app.use(compression());
  app.post('/orders', (req, res) => ordersController.handle(req, res));
  app.get('/healthcheck', (req, res) => res.send({ uptime: process.uptime() }));
  app.listen(port, () => {
    logger.info(`${packageJson.name} v${packageJson.version} has started on port ${port} [host: ${os.hostname}]`);
  });
}
