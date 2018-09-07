import { ChannelApeClient, Order, OrderStatus, OrdersQueryRequestByBusinessId } from 'channelape-sdk';
import { ChannelApeActionsController } from 'channelape-web-service-sdk';
import * as moment from 'moment';
import * as Q from 'q';
import { Logger } from 'channelape-logger';

import Secrets from '../../util/Secrets';
import OrderFilteringService from '../service/OrderFilteringService';
import OrderUpdateService from '../service/OrderUpdateService';

const logger = new Logger('Orders Controller', Secrets.env.LOG_LEVEL);

export default class OrdersController extends ChannelApeActionsController {
  private orderUpdateService: OrderUpdateService;

  constructor(channelApeClient: ChannelApeClient) {
    super('Orders Controller', channelApeClient);
    this.channelApeClient = channelApeClient;
    this.orderUpdateService = new OrderUpdateService(channelApeClient);
  }

  protected processAction(businessId: string, actionId: string): Promise<void> {
    const now = moment.utc();
    const requestOptions: OrdersQueryRequestByBusinessId = {
      businessId,
      status: OrderStatus.OPEN,
      startDate: this
        .getOrderRetrievalStartDate(now.clone(), Secrets.env.CHANNEL_APE_OPEN_ORDERS_START_DATE_INTERVAL_DAYS),
      endDate: this.getOrderRetrievalEndDate(now.clone(), Secrets.env.OPEN_ORDERS_RETRIEVAL_DELAY_MINUTES)
    };
    this.logger.info(`Querying for ${requestOptions.status} orders`);
    return this.channelApeClient.orders().get(requestOptions)
      .then(openOrders => this.processOrders(openOrders))
      .then(() => this.complete(actionId))
      .catch(err => this.handleError(err, actionId));
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
}
