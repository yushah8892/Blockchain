const TransactionPool = require('./transaction-pool');
const Transaction = require('./transaction');
const Wallet = require('./index');


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
});