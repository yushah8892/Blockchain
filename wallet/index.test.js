const Wallet = require('./index');
const { verifySignature } = require('../util/index');
const Transaction = require('./transaction');

describe('Wallet',()=>{

    let wallet;

    beforeEach(()=>{
        wallet = new Wallet();
    });

    it('has a `balance`',()=>{
        expect(wallet).toHaveProperty('balance');
    });

    it('has public key',()=>{
        expect(wallet).toHaveProperty('publicKey');
    });

    describe('signing data',()=>{
        const data = 'foobar';

        it('verifies a singnature',()=>{
          expect(verifySignature({publicKey : wallet.publicKey, data,    signature : wallet.sign(data)})).toBe(true);
            
        });


        it('is not verifies a invalid singnature',()=>{
            expect(
                verifySignature({
                    publicKey : wallet.publicKey,
                    data,
                    signature : new Wallet().sign(data)
                })
            ).toBe(false);
        });

    });

    describe('createTransaction()',()=>{
        describe('when the amount exceed the balance',()=>{
            it('throws and error',()=>{
                expect(()=>wallet.createTransaction({amount:99999,recipient :'foo-address'})).toThrow('Amount Exceeds Balance');
            });
        });

        describe('and the amount is valid',()=>{

                let trasaction,amount,recipient;

                beforeEach(()=>{
                    amount = 50;
                    recipient = 'foo-address';
                    trasaction = wallet.createTransaction({amount,recipient});
                });
                it('creates the instance of Tranaction',()=>{
                        expect(trasaction instanceof Transaction ).toBe(true);
                });

                it('matches the transaction input with the wallet',()=>{
                        expect(trasaction.input.address).toEqual(wallet.publicKey);
                });

                it('outputs the amount to the recipient',()=>{
                        expect(trasaction.outputMap[recipient]).toEqual(amount);
                });
        });
        
    });
});

