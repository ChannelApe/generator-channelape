import * as appRootPath from 'app-root-path';
import { expect } from 'chai';
import { ChannelApeClient, Order, ChannelApeError } from 'channelape-sdk';
import * as fs from 'fs';
import * as sinon from 'sinon';
import { mockReq, mockRes } from 'sinon-express-mock';
import OrdersController from '../../../../src/channelape/orders/controller/OrdersController';

describe('OrdersController', () => {
  let sandbox: sinon.SinonSandbox;
  let channelApeClient: ChannelApeClient;
  let updateHealthCheckStub: sinon.SinonStub;
  let completeHealthCheckStub: sinon.SinonStub;
  let errorHealthCheckStub: sinon.SinonStub;
  let ordersGetStub: sinon.SinonStub;
  let ordersUpdateStub: sinon.SinonStub;
  let ordersController: OrdersController;
  let mockOrderData1: Order[];

  beforeEach(() => {
    mock();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('responds with a 200 status', () => {
    const request = { body: { actionId: 'action_id' } };
    const req = mockReq(request);
    const res = mockRes<{ headersSent: boolean }>({
      headersSent: false
    });
    return ordersController.handle(req, res)
      .then(() => {
        expect(res.sendStatus.calledWith(200)).to.be.true;
      });
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
    sandbox.restore();
    const request = { body: { actionId: 'action_id' } };
    const req = mockReq(request);
    const res = mockRes();
    updateHealthCheckStub = sandbox.stub().resolves({ healthCheckIntervalInSeconds: 300 });
    completeHealthCheckStub = sandbox.stub().resolves();
    errorHealthCheckStub = sandbox.stub().resolves();
    ordersGetStub = sandbox.stub().rejects(new ChannelApeError('API Error', undefined, 'api-endpoint', [
      {
        code: 99,
        message: 'Generic API Error message'
      }
    ]));
    sandbox.stub(ChannelApeClient.prototype, 'orders').returns({
      get: ordersGetStub
    });
    sandbox.stub(ChannelApeClient.prototype, 'actions').returns({
      updateHealthCheck: updateHealthCheckStub,
      complete: completeHealthCheckStub,
      error: errorHealthCheckStub
    });
    channelApeClient = new ChannelApeClient({ sessionId: 'session_id' });
    ordersController = new OrdersController(channelApeClient);

    return ordersController.handle(req, res)
      .then(() => {
        expect(errorHealthCheckStub.calledOnce).to.be.true;
      });
  });

  function mock(rejectAction: boolean = false) {
    sandbox = sinon.createSandbox();
    mockOrderData1 = JSON.parse(fs.readFileSync(`${appRootPath}/test/resources/orders1.json`, 'utf-8'));

    if (rejectAction) {
      updateHealthCheckStub = sandbox.stub().rejects(new Error('missing actionId on request body'));
    } else {
      updateHealthCheckStub = sandbox.stub().resolves({ healthCheckIntervalInSeconds: 300 });
    }
    completeHealthCheckStub = sandbox.stub().resolves();
    errorHealthCheckStub = sandbox.stub().resolves();
    ordersGetStub = sandbox.stub().resolves(mockOrderData1);
    ordersUpdateStub = sandbox.stub().resolves((order: Order) => order);
    sandbox.stub(ChannelApeClient.prototype, 'orders').returns({
      get: ordersGetStub,
      update: ordersUpdateStub
    });
    sandbox.stub(ChannelApeClient.prototype, 'actions').returns({
      updateHealthCheck: updateHealthCheckStub,
      complete: completeHealthCheckStub,
      error: errorHealthCheckStub
    });

    channelApeClient = new ChannelApeClient({ sessionId: 'session_id' });
    ordersController = new OrdersController(channelApeClient);
  }
});
