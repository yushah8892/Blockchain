const Transaction = require('./transaction');

class TransactionPool{
    constructor(){
        this.transactionMap ={};
    }

    setTransaction(transaction){
        this.transactionMap[transaction.id] =transaction;
    }

    existingTransaction({inputAddress}){
        const transaction = Object.values(this.transactionMap);

        return transaction.find((transaction)=> transaction.input.address === inputAddress);
    }

    setMap(transactionPoolMap){
        this.transactionMap = transactionPoolMap;
    }

    validTransaction(){
           return  Object.values(this.transactionMap).filter((transaction)=>{
                   return  Transaction.validTransaction(transaction)
            });

    }

    clear(){
        this.transactionMap = {};
    }
    clearBlockchainTransaction({chain}){
        for(let i=0;i<chain.length;i++){
            const block = chain[i];

            for(let transaction of block.data){
                    if(this.transactionMap[transaction.id]){
                            delete this.transactionMap[transaction.id];
                    }
            }
        }
    }
}


module.exports = TransactionPool;