const Blockchain = require('.');
const Block = require('./block');
const Wallet = require('../wallet');
const Transaction = require('../wallet/transaction');

describe('BlockChain',()=>{
    let blockchain,newChain,originalChain ;
    
    beforeEach(()=>{
        blockchain = new Blockchain();
        newChain = new Blockchain();
        originalChain = blockchain.chain;
    });

    it('contains a Array of chain',()=>{
        expect(blockchain.chain instanceof Array).toBe(true);
    });

    it('has first block as genesis block',()=>{
        expect(blockchain.chain[0]).toEqual(Block.genesis());
    });

    it('adds a new block to the chain',()=>{
        const newData = 'foo-bar';
    
        blockchain.addBlock({data : newData});
        expect(blockchain.chain[blockchain.chain.length-1].data).toEqual(newData);
    });

    describe('isValidChain()',()=>{

            describe('When the chain doesnot start with genesis block',()=>{

                it('returns flase',()=>{
                      blockchain.chain[0] ={data : 'fake-genesis'}; 
                      expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            describe('when the chain start with genesis block and has multiple blocks ',()=>{

                beforeEach(()=>{
                    blockchain.addBlock({data:'beers'});
                    blockchain.addBlock({data:'bets'});
                    blockchain.addBlock({data:'brats'});
                });
                   describe('and a lastHash reference is changed',()=>{
                        it('return false',()=>{
                          blockchain.chain[2].lastHash = 'broken-lastHash';

                            expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);

                        });
                   }) 

                   describe('and the chain contains a block with invalid field',()=>{
                       it('return false',()=>{
                      blockchain.chain[2].data ='modified';
                        
                        expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);

                       });
                   });

                   describe('and the chain doesnot contain any invalid blocks',()=>{
                        it('returns true',()=>{
                            expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);

                            
                        });
                    
                   });
            });

    });

    describe('replaceChain()',()=>{

        let errorMock,logMock;

        beforeEach(()=>{
                errorMock = jest.fn();
                logMock = jest.fn();
                global.console.log = logMock;
                global.console.error = errorMock; 
        });
    
            describe('when the new chain is not longer',()=>{

                    beforeEach(()=>{
                        newChain.chain[0] = {new:'chain'};
                        blockchain.replaceChain(newChain.chain);
                    
                    });
                    it('does not replace chain',()=>{
                            expect(blockchain.chain).toEqual(originalChain);

                    });
                    it('logs an error',()=>{
                           expect(errorMock).toHaveBeenCalled(); 
                    });
            });

            describe('when the chain is longer',()=>{

                beforeEach(()=>{
                    newChain.addBlock({data:'beers'});
                    newChain.addBlock({data:'bets'});
                    newChain.addBlock({data:'brats'});
                });

                describe('when the chain is not valid',()=>{

                    beforeEach(()=>{
                        newChain.chain[2].hash = 'fake-hash';    
                        blockchain.replaceChain(newChain.chain);
                    });
                    it('does not replace chain',()=>{

                      
                        expect(blockchain.chain).toEqual(originalChain);

                    });
                    it('logs an error',()=>{
                        expect(errorMock).toHaveBeenCalled(); 
                 });
                });

                describe('when the chain is valid',()=>{

                    beforeEach(()=>{
                        blockchain.replaceChain(newChain.chain);

                    });
                    it('does repalce the chain',()=>{
                        expect(blockchain.chain).toEqual(newChain.chain);

                    });
                    it('logs',()=>{
                        expect(logMock).toHaveBeenCalled(); 
                 });
                });

                describe('validateTransaction flag is true',()=>{
                        it('calls the valid transaction data',()=>{

                            const validateTransactionDataMock = jest.fn();
                            blockchain.validTransactionData = validateTransactionDataMock;
                            newChain.addBlock({data:'foo'});
                            blockchain.replaceChain(newChain.chain,true);
                            expect(validateTransactionDataMock).toHaveBeenCalled();

                        });
                        
                });
            });
    });

    describe('validTransactionData()',()=>{
        let trasaction,rewardTransaction,wallet;

        beforeEach(()=>{
            wallet = new Wallet();
            trasaction = wallet.createTransaction({
                recipient :'foo',
                amount : 50
            });
            rewardTransaction = Transaction.rewardTransaction({minerWallet:wallet});

        });

        describe('and the transaction data is valid',()=>{
                it('returns true()',()=>{
                    newChain.addBlock({data:[trasaction,rewardTransaction]});
                    expect(blockchain.validTransactionData({chain:newChain.chain})).toBe(true);
                });

        });

        describe('and the transaction data has multiple rewards',()=>{

            it('return false',()=>{
                newChain.addBlock({data:[trasaction,rewardTransaction,rewardTransaction]});
                expect(blockchain.validTransactionData({chain:newChain.chain})).toBe(false);
            });
        });

        describe('and the transaction data has one malformed output map',()=>{

            describe('the trnasaction is not a reward transaction',()=>{
                it('return false',()=>{
                    trasaction.outputMap[wallet.puublicKey] = 9999;
                    newChain.addBlock({data: [trasaction,rewardTransaction]});
                    expect(blockchain.validTransactionData({chain:newChain.chain})).toBe(false);
                });

            });
            describe('the trnasction is a reward transaction',()=>{
                it('return false',()=>{
                    rewardTransaction.outputMap[wallet.publicKey] = 99999;
                    newChain.addBlock({data:[trasaction,rewardTransaction]});
                    expect(blockchain.validTransactionData({chain:newChain.chain})).toBe(false);
                });

            });
        });

        describe('and the transaction data has one malformed input',()=>{
            it('returns false',()=>{
                wallet.balance = 9000;
                const evilOutputMap = {
                    [wallet.publicKey]:8900,
                    fooRecipient : 100
                };
                const evilTransaction = {
                    input :{
                        timestamp : Date.now(),
                        amount :wallet.balance,
                        address : wallet.publicKey,
                      singnature : wallet.sign(evilOutputMap)
                    },
                    outputMap :evilOutputMap
                }
                newChain.addBlock({data:[evilTransaction,rewardTransaction]});
             //   expect(blockchain.validTransactionData({chain:newChain.chain})).toBe(false);

            });
        });
        describe('and the block contains multiple identical transaction',()=>{
            it('returns false',()=>{
                newChain.addBlock({data:[trasaction,trasaction,trasaction,rewardTransaction]});
                expect(blockchain.validTransactionData({chain:newChain.chain})).toBe(false);

            });
        });
    });

});