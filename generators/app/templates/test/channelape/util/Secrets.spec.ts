import { expect } from 'chai';
import * as dotenv from 'dotenv';
import * as sinon from 'sinon';
import Secrets from '../../../src/channelape/util/Secrets';

describe('Secrets', () => {
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('properly inits the envars', () => {
    process.env.TEST1 = 'test one';
    process.env.TEST2 = 'test two';
    Secrets.env = {
      TEST1: '',
      TEST2: '',
    };
    const dotenvSpy = sandbox.spy(dotenv, 'config');
    Secrets.initialize();

    expect(dotenvSpy.calledOnce).to.be.true;
    expect(Secrets.env.TEST1).to.equal('test one');
    expect(Secrets.env.TEST2).to.equal('test two');
  });

  it('throws error on missing envar', () => {
    process.env.TEST3 = 'test one';
    process.env.TEST4 = 'test two';
    Secrets.env = {
      TEST3: '',
      TEST5: '',
    };
    const validateSpy = sandbox.spy(Secrets, 'validateEnvars');

    try {
      validateSpy();
    } catch (e) {
      expect(e).not.to.be.undefined;
      expect(validateSpy.threw()).to.be.true;
    }
  });
});
