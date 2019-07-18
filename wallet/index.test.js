const Wallet = require('./index');
const { verifySignature } = require('../util/index');
const Transaction = require('./transaction');
const Blockchain = require('../blockchain');
const {STARTING_BALANCE} = require('../config');
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

    /*    describe('and a chain is passed',()=>{
            it('calls wallet.calculteBalnace() is called',()=>{
                const calculateBalanceMock = jest.fn();
                Wallet.calculateBalance = calculateBalanceMock;
                const originalCalculateBalance = Wallet.calculateBalance();

                wallet.createTransaction({
                    recipient:'foo',
                    amount :40,
                    chain :new Blockchain()
                });

                expect(calculateBalanceMock).toHaveBeenCalled();
                Wallet.calculateBalance = originalCalculateBalance;
            });
        });*/
        
        describe('calculateBalance()',()=>{
                let blockchain;
                beforeEach(()=>{
                    blockchain = new Blockchain();

                });

                describe('and no outputs for the wallet',()=>{
                    it('returns the starting balance of the wallet',()=>{
                        
                        expect(Wallet.calculateBalance({
                            chain : blockchain.chain,
                            address : wallet.publicKey
                        })).toEqual(STARTING_BALANCE);
                    });
                });

                describe('there are outputs for the wallet',()=>{
                        let transactionOne, transactionTwo;
                        beforeEach(()=>{
                            transactionOne = new Wallet().createTransaction({recipient:wallet.publicKey,amount:50});
                            transactionTwo = new Wallet().createTransaction({recipient:wallet.publicKey,amount:40});
                            blockchain.addBlock({data:[transactionOne,transactionTwo]});

                        }); 

                       it('adds the sum of all output to the wallet balance',()=>{

                            expect( Wallet.calculateBalance({
                                chain:blockchain.chain,
                                address : wallet.publicKey
                            })).toEqual(STARTING_BALANCE + 
                                transactionOne.outputMap[wallet.publicKey] + 
                                transactionTwo.outputMap[wallet.publicKey] 
                                );
                          
                       }); 
                    
                       describe('and the wallet has made a transaction',()=>{
                           let recentTransaction;

                           beforeEach(()=>{
                                recentTransaction = wallet.createTransaction({
                                    recipient:'foo',
                                    amount:50
                                });

                                blockchain.addBlock({data: [recentTransaction]});
                           });
                           it('return the output amount of the recent transaction',()=>{
                            expect(Wallet.calculateBalance({chain:blockchain.chain,address:wallet.publicKey})).toEqual(recentTransaction.outputMap[wallet.publicKey]);
 
                        });
                       });

                      

                       describe('and there are  outputs next to and after the recent transction',()=>{
                           let sameBlockTransaction,nextBlockTransaction;
                           beforeEach(()=>{
                               recentTransaction = wallet.createTransaction({
                                   address:'later-foo',
                                   amount:60
                               });
                               sameBlockTransaction = Transaction.rewardTransaction({minerWallet: wallet});

                               blockchain.addBlock({data:[recentTransaction,sameBlockTransaction]});

                               nextBlockTransaction = new Wallet().createTransaction({
                                   recipient:wallet.publicKey,
                                   amount:100
                               });
                               blockchain.addBlock({data:[nextBlockTransaction]});
                           }); 

                            it('includes the  output amount in the returned balance',()=>{
                                expect(Wallet.calculateBalance({
                                    chain:blockchain.chain,
                                    address: wallet.publicKey
                                })).toEqual(
                                    recentTransaction.outputMap[wallet.publicKey] + 
                                    sameBlockTransaction.outputMap[wallet.publicKey] + 
                                    nextBlockTransaction.outputMap[wallet.publicKey]
                                );
                            });
                       });

                });


        });
    });
});

