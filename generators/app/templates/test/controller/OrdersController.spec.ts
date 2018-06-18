import * as appRootPath from 'app-root-path';
import { expect } from 'chai';
import { ChannelApeClient, Order } from 'channelape-sdk';
import * as fs from 'fs';
import * as path from 'path';
import * as sinon from 'sinon';
import { mockReq, mockRes } from 'sinon-express-mock';
import OrdersController from '../../src/controller/OrdersController';

let orderValidationStub: sinon.SinonStub;

describe('OrdersController', () => {
  let sandbox: sinon.SinonSandbox;
  let channelApeClient: ChannelApeClient;
  let updateHealthCheckStub: sinon.SinonStub;
  let completeHealthCheckStub: sinon.SinonStub;
  let errorHealthCheckStub: sinon.SinonStub;
  let ordersGetStub: sinon.SinonStub;
  let ordersController: OrdersController;
  let orderParsingStub: sinon.SinonStub;
  let orderUpdateStub: sinon.SinonStub;
  let mockOrderData1: Order[];

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    mockOrderData1 = JSON.parse(fs.readFileSync(path.join(appRootPath.toString(),
      './test/resources/OrderParsingServiceTestOrders1.json')).toString());

    orderUpdateStub = sandbox.stub(OrderUpdateService.prototype, 'updateOrderStatusByIds').resolves();
    orderParsingStub = sandbox.stub(OrderParsingService, 'parseOrders').resolves({
      lineItemData: mockOrderData1,
      openOrderIds: ['order_1', 'order_2', 'order_3']
    });

    updateHealthCheckStub = sandbox.stub().resolves({ healthCheckIntervalInSeconds: 300 });
    completeHealthCheckStub = sandbox.stub().resolves();
    errorHealthCheckStub = sandbox.stub().resolves();
    ordersGetStub = sandbox.stub().resolves(mockOrderData1);
    sandbox.stub(ChannelApeClient.prototype, 'orders').returns({ get: ordersGetStub });
    sandbox.stub(ChannelApeClient.prototype, 'actions').returns({
      updateHealthCheck: updateHealthCheckStub,
      complete: completeHealthCheckStub,
      error: errorHealthCheckStub
    });

    channelApeClient = new ChannelApeClient({ sessionId: 'session_id' });
    ordersController = new OrdersController(channelApeClient);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('responds with a 200 status', () => {
    const request = { body: { actionId: 'action_id' } };
    const req = mockReq(request);
    const res = mockRes();
    return ordersController.handle(req, res)
      .then(() => {
        expect(res.sendStatus.calledWith(200)).to.be.true;
      });
  });

  it('rejects requests without an action ID', () => {
    const req = mockReq();
    const res = mockRes();
    ordersController.handle(req, res);
    expect(res.status.calledWith(400)).to.be.true;
    expect(res.send.getCall(0).args[0]).to.equal('ERROR: missing actionId on request body');
  });

  it('receives orders from the channelape SDK', () => {
    const request = { body: { actionId: 'action_id' } };
    const req = mockReq(request);
    const res = mockRes();
    return ordersController.handle(req, res)
      .then(() => {
        return ordersGetStub.getCall(0).returnValue.then((orders: Order[]) => {
          expect(orders).to.equal(mockOrderData1);
        });
      });
  });

  it('passes orders to the order validation service', () => {
    const request = { body: { actionId: 'action_id' } };
    const req = mockReq(request);
    const res = mockRes();
    return ordersController.handle(req, res)
      .then(() => {
        expect(orderValidationStub.getCall(0).args[0]).to.equal(mockOrderData1);
      });
  });

  it('passes orders to the order address concat service', () => {
    const request = { body: { actionId: 'action_id' } };
    const req = mockReq(request);
    const res = mockRes();
    return ordersController.handle(req, res)
      .then(() => {
        expect(orderAddressConcatStub.getCall(0).args[0]).to.equal(mockOrderData1);
      });
  });

  it('passes orders to the order parsing service', () => {
    const request = { body: { actionId: 'action_id' } };
    const req = mockReq(request);
    const res = mockRes();
    return ordersController.handle(req, res)
      .then(() => {
        expect(orderParsingStub.getCall(0).args[0]).to.equal(mockOrderData1);
      });
  });

  it('doesnt call RSSBus uploader if no file is created', () => {
    orderCsvCreationStub.restore();
    const request = { body: { actionId: 'action_id' } };
    const req = mockReq(request);
    const res = mockRes();
    return ordersController.handle(req, res)
      .then(() => {
        expect(rssBusUploaderStub.called).to.be.false;
        expect(errorHealthCheckStub.called).to.be.false;
        expect(completeHealthCheckStub.calledOnce).to.be.true;
      });
  });

  it('passes a csv filename to the RSSBus uploder service', () => {
    const request = { body: { actionId: 'action_id' } };
    const req = mockReq(request);
    const res = mockRes();
    return ordersController.handle(req, res)
      .then(() => {
        expect(rssBusUploaderStub.getCall(0).args[0]).to.equal('orders_data.csv');
      });
  });

  it('passes a list of order IDs to be changed to IN_PROGRESS', () => {
    const request = { body: { actionId: 'action_id' } };
    const req = mockReq(request);
    const res = mockRes();
    return ordersController.handle(req, res)
      .then(() => {
        expect(orderUpdateStub.getCall(0).args[0]).to.deep.equal(['order_1', 'order_2', 'order_3']);
        expect(orderUpdateStub.getCall(0).args[1]).to.deep.equal('IN_PROGRESS');
      });
  });

  it('updates the action to complete', () => {
    const request = { body: { actionId: 'action_id' } };
    const req = mockReq(request);
    const res = mockRes();
    return ordersController.handle(req, res)
      .then(() => {
        expect(completeHealthCheckStub.calledOnce).to.be.true;
      });
  });

  it('catches errors', () => {
    rssBusUploaderStub.restore();
    const request = { body: { actionId: 'action_id' } };
    const req = mockReq(request);
    const res = mockRes();
    return ordersController.handle(req, res)
      .then(() => {
        expect(errorHealthCheckStub.calledOnce).to.be.true;
      });
  });
});
