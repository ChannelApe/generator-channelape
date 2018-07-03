import { Order } from 'channelape-sdk';
import * as Q from 'q';
import { Logger } from 'channelape-logger';
import Secrets from '../../util/Secrets';

const logger = new Logger('Order Filtering Service', Secrets.env.LOG_LEVEL);

export default class OrderFilteringService {
  public static filterOrders(orders: Order[]): Q.Promise<Order[]> {
    const deferred = Q.defer<Order[]>();
    try {
      const parsedOrders = orders.filter(this.filterOrdersToBeParsed);
      deferred.resolve(parsedOrders);
    } catch (err) {
      deferred.reject(err);
    }
    return deferred.promise;
  }

  private static filterOrdersToBeParsed(order: Order, index: number, orders: Order[]): boolean {
    // TODO: add filtering logic
    logger.info(`Order ID: ${order.id} has passed filtering and will be updated.`);
    return true;
  }
}
