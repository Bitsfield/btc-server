const btcUtils = require('./btc-utils');
const bitcoin = require('bitcoinjs-lib');
const bip39 = require('bip39');
const request = require('request');
const util = require('util');

jest.mock('request');
jest.mock('bitcoinjs-lib');
jest.mock('bip39');

describe('BTC Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateRootAddress', () => {
    it('should generate root address', () => {
      const mockHDNode = { getAddress: jest.fn().mockReturnValue('rootAddr') };
      bip39.mnemonicToSeed.mockReturnValue(Buffer.from('dummyseed'));
      bitcoin.HDNode.fromSeedBuffer.mockReturnValue({deriveHardened: jest.fn().mockReturnValue({derive: jest.fn().mockReturnValue({derive: jest.fn().mockReturnValue(mockHDNode)})})});
      const addr = btcUtils.generateRootAddress();
      expect(addr).toBe('rootAddr');
    });
  });

  describe('generateNewAddress', () => {
    it('should generate new address from old', () => {
      const oldAddy = {indx: 0};
      const mockHDNode = { getAddress: jest.fn().mockReturnValue('newAddr') };
      bitcoin.HDNode.fromSeedBuffer.mockReturnValue({deriveHardened: jest.fn().mockReturnValue({derive: jest.fn().mockReturnValue({derive: jest.fn().mockReturnValue(mockHDNode)})})});
      const addr = btcUtils.generateNewAddress(oldAddy);
      expect(addr).toBe('newAddr');
    });
  });

  // For getTxFee, processTransaction, would need more mocks for http and internal functions
  // Simple test for getTxFee assuming mocks
  // describe('getTxFee', () => {
    //   it('should get tx fee', async () => {
    //     const mockRequestAsync = jest.fn().mockResolvedValue([{statusCode: 200}, JSON.stringify({hourFee: 10})]);
    //     jest.spyOn(util, 'promisify').mockImplementation(() => mockRequestAsync);
    //     const fee = await btcUtils.getTxFee(1, 2, 'low');
    //     expect(fee).toBe(2590); // 10 * ((1*180) + (2*34) + 10 + 1)
    //   });
    // });

  // Skip complex processTransaction for now, or add with mocks
});
