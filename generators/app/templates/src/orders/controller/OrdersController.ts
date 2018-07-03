import { ChannelApeClient, Order, OrderStatus, OrdersQueryRequestByBusinessId } from 'channelape-sdk';
import { Request, Response } from 'express';
import * as moment from 'moment';
import * as Q from 'q';
import { Logger } from 'channelape-logger';
import OrderFilteringService from '../service/OrderFilteringService';
import OrderUpdateService from '../service/OrderUpdateService';

import Secrets from '../../util/Secrets';

const logger = new Logger('Orders Controller', Secrets.env.LOG_LEVEL);

const PARSE_INT_RADIX = 10;
const HEALTH_CHECK_INTERVAL_MS = 1000;

export default class OrdersController {
  private channelApeClient: ChannelApeClient;
  private orderUpdateService: OrderUpdateService;

  constructor(channelApeClient: ChannelApeClient) {
    this.channelApeClient = channelApeClient;
    this.orderUpdateService = new OrderUpdateService(channelApeClient);
  }

  public handle(req: Request, res: Response): Promise<void> {
    const actionId = req.body.actionId;
    if (!actionId) {
      const err = 'ERROR: missing actionId on request body';
      logger.error(err);
      res.status(400).send(err);
      return Promise.resolve();
    }

    res.sendStatus(200);
    let updateHealthCheckInterval: NodeJS.Timer;
    let businessId: string;
    logger.info(`Getting OPEN orders with action ${actionId}`);
    return this.channelApeClient.actions().updateHealthCheck(actionId)
      .then((updatedAction) => {
        updateHealthCheckInterval = this.startHealthCheckInterval(actionId, updatedAction.healthCheckIntervalInSeconds);
        businessId = updatedAction.businessId;
      })
      .then(() => this.getOrders(businessId))
      .then(orders => this.processOrders(orders))
      .then(() => {
        clearInterval(updateHealthCheckInterval);
        this.complete(actionId);
      })
      .catch((err) => {
        clearInterval(updateHealthCheckInterval);
        this.handleError(err, actionId);
      });
  }

  private startHealthCheckInterval(actionId: string, intervalInSeconds: number): NodeJS.Timer {
    return setInterval(() => {
      logger.info(`Updating healthcheck for action ${actionId}`);
      this.channelApeClient.actions().updateHealthCheck(actionId)
        .catch((err: Error) => {
          logger.error(`Failed to update health check for action ${actionId} because ${JSON.stringify(err)}`);
        });
    }, intervalInSeconds * HEALTH_CHECK_INTERVAL_MS);
  }

  private getOrders(businessId: string): Promise<Order[]> {
    const now = moment().utc();
    const requestOptions: OrdersQueryRequestByBusinessId = {
      businessId,
      status: OrderStatus.OPEN,
      startDate: this.getOpenOrderRetrievalStartDate(now.clone()),
      endDate: this.getOpenOrderRetrievalEndDate(now.clone())
    };
    return this.channelApeClient.orders().get(requestOptions);
  }

  private processOrders(orders: Order[]): Q.Promise<Order[]> {
    logger.info(`Received ${orders.length} total orders`);
    const deferred = Q.defer<Order[]>();
    OrderFilteringService.filterOrders(orders)
      .then(filteredOrders => this.orderUpdateService.updateOrders(filteredOrders))
      .then(updatedOrders => deferred.resolve(updatedOrders))
      .catch((err: Error) => deferred.reject(err));
    return deferred.promise;
  }

  private complete(actionId: string): void {
    this.channelApeClient.actions().complete(actionId)
      .then(() => logger.info(`Action ${actionId} has been completed`))
      .catch((err: Error) => logger.error(`Error completing action ${actionId} ${JSON.stringify(err)}`));
  }

  private handleError(err: any, actionId: string): void {
    let error: any;
    if (err.message !== undefined) {
      error = JSON.stringify(err.message);
    } else {
      error = JSON.stringify(err);
    }
    this.channelApeClient.actions().error(actionId)
      .then(() => logger.info(`Action ${actionId} has been set as errored`))
      .catch((err: Error) => logger.error(`Error setting action ${actionId} state as errored ${JSON.stringify(err)}`));
    logger.error(`Action ${actionId} has failed with error ${error}`);
  }

  private getOpenOrderRetrievalStartDate(now: moment.Moment): Date {
    const lookBackIntervalDate =
      now.subtract({ days: parseInt(Secrets.env.CHANNEL_APE_OPEN_ORDERS_START_DATE_INTERVAL_DAYS, PARSE_INT_RADIX) });
    const absoluteStartDate: moment.Moment = moment(new Date(Secrets.env.CHANNEL_APE_OPEN_ORDERS_START_DATE));
    if (lookBackIntervalDate.unix() > absoluteStartDate.unix()) {
      return lookBackIntervalDate.toDate();
    }
    return absoluteStartDate.toDate();
  }

  private getOpenOrderRetrievalEndDate(now: moment.Moment): Date {
    return now
      .subtract({ minutes: parseInt(Secrets.env.OPEN_ORDERS_RETRIEVAL_DELAY_MINUTES, PARSE_INT_RADIX) }).toDate();
  }
}
