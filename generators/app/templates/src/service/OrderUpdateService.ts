import { ChannelApeClient, Order, OrderStatus } from 'channelape-sdk';
import * as Q from 'q';
import { Logger } from 'channelape-logger';
import Secrets from '../util/Secrets';

const logger = new Logger('Order Update Service', Secrets.env.LOG_LEVEL);

export default class OrderUpdateService {
  private channelApeClient: ChannelApeClient;

  constructor(channelApeClient: ChannelApeClient) {
    this.channelApeClient = channelApeClient;
  }

  public updateOrders(orders: Order[]): Q.Promise<Order[]> {
    const deferred = Q.defer<Order[]>();
    const promises = orders.map((order) => {
      return this.updateSingleOrder(order);
    });
    Q.allSettled(promises)
      .then((results: Q.PromiseState<Order>[]) => {
        results.forEach((result, idx) => {
          if (result.state === 'rejected') {
            logger.error(result.reason);
          }
        });
        logger.info(`Finished updating ${orders.length} orders`);
        deferred.resolve();
      })
      .catch((err: Error) => deferred.reject(err));
    return deferred.promise;
  }

  private updateSingleOrder(order: Order): Q.Promise<Order> {
    const deferred = Q.defer<Order>();
    const updatedOrder = this.getUpdatedOrder(order);
    this.channelApeClient.orders().update(updatedOrder)
      .then((updatedOrder: Order) => deferred.resolve(updatedOrder))
      .catch((err: Error) => {
        deferred.reject(`Failed to update order with ID of ${order.id} due to error of: ${JSON.stringify(err)}`);
      });
    return deferred.promise;
  }

  private getUpdatedOrder(order: Order): Order {
    // TODO: Add logic to update the order
    return order;
  }
}
