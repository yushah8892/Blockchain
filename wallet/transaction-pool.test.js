const TransactionPool = require('./transaction-pool');
const Transaction = require('./transaction');
const Wallet = require('./index');
const Blockchain = require('../blockchain');

describe('TransactionPool()',()=>{
    let transctionPool, transaction;

    beforeEach(()=>{
        transctionPool = new TransactionPool();
        transaction = new Transaction({
            senderWallet:new Wallet(),
            recipient: 'fake-recipient',
            amount:50
        });
    });

    describe('setTransaction()',()=>{
            it('add Transaction',()=>{
                transctionPool.setTransaction(transaction);
                expect(transctionPool.transactionMap[transaction.id]).toBe(transaction);
            });
    });

    describe('validTransaction()',()=>{
            let validTransaction,errorMock;


            beforeEach(()=>{
                validTransaction = [];
                errorMock = jest.fn();
                global.console.error = errorMock;
                for(let i=0;i<10;i++){
                       transaction = new Transaction({
                           senderWallet : new Wallet(),
                           recipient:'any-recipient',
                           amount:50
                       });
                       if(i%3===0){
                           transaction.input.amount = 99999;
                       }else if(i%3===1){
                           transaction.input.signature= new Wallet().sign('foo'); 
                       }else{
                           validTransaction.push(transaction);
                       }
                       transctionPool.setTransaction(transaction); 
                }

            });

            it('returns the valid Transction',()=>{

                expect(transctionPool.validTransaction()).toEqual(validTransaction);
            });



    });

    describe('crear()',()=>{
        it('clears the transaction',()=>{
            transctionPool.clear();
            expect(transctionPool.transactionMap).toEqual({});

        });
    });

    describe('clearBlockchainTransaction() ',()=>{
        it('clears the pool of any exisintg blockchain',()=>{
                const blockchain = new Blockchain();
                const expectedTransactionMap = {};
                for(let i =0;i<6;i++){
                    const transaction = new Wallet().createTransaction({
                        recipient:'foo',
                        amount:10
                    });
                    transctionPool.setTransaction(transaction);

                    if(i%2===0){
                        blockchain.addBlock({data:[transaction]});
                    }else{
                        expectedTransactionMap[transaction.id] = transaction;
                    }
                }
                transctionPool.clearBlockchainTransaction({chain:blockchain.chain});
                expect(transctionPool.transactionMap).toEqual(expectedTransactionMap);
        });
    });
});