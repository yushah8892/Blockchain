const Transction = require('../wallet/transaction');
class TransactionMiner{

        constructor({blockchain,transactionPool,wallet,pubsub}){
            this.blockchain = blockchain;
            this.transactionPool = transactionPool;
            this.wallet = wallet;
            this.pubsub = pubsub;
     }
    mineTransaction(){

        //get the tx pool's valid transaction
        const validTransaction = this.transactionPool.validTransaction();

        //generate the miner's reward
        validTransaction.push(Transction.rewardTransaction({minerWallet:this.wallet}));
        
        //add a block consisting these tx to the blockchain
        this.blockchain.addBlock({data:validTransaction});
        //broadcast updated blockchain
        this.pubsub.broadcastChain();

        //clear the pool
        this.transactionPool.clear();
    };

}

module.exports = TransactionMiner;