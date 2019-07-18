const Block = require('./block');
const { cryptoHash } = require('../util');
const {REWARD_INPUT,MINING_REWARD} = require('../config');
const Transaction = require('../wallet/transaction');
const Wallet = require('../wallet');
class Blockchain{
        constructor(){
            this.chain =[Block.genesis()];
        }

         addBlock({data}){
            const newBlock = Block.mineBlock({
                lastBlock : this.chain[this.chain.length -1],
                data
            });
            this.chain.push(newBlock);
        }

        replaceChain(chain,validateTransaction, onSuccess){
                if(chain.length < this.chain.length){
                    console.error('new chain length must be greater then current length of chain');
                        return;
                }
                if(!Blockchain.isValidChain(chain)){
                    console.error('new chain must be a valid chain');
                    return;
                }

                if(validateTransaction && !this.validTransactionData({chain})){
                    console.error('incoming chain has invlaid transaction data.');
                    return;
                }
                if(onSuccess) onSuccess();

                console.log('chain is replace with',chain);
                this.chain = chain;
      
        }
        static isValidChain(chain){
            if(JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())){
                return false;
            }

            for(let i=1;i<chain.length;i++){
                const Block = chain[i];
                const {timestamp,lastHash,hash,data,nonce,difficulty} = Block;
                const ActualLasthash = chain[i-1].hash;

                if(ActualLasthash !== lastHash){
                       return false;
                }

                const validateHash = cryptoHash(timestamp,lastHash,data,nonce,difficulty);

                if(hash !== validateHash){
                        return false;
                }
            }

            return true;
        }

        validTransactionData({chain}){

                for(let i=1;i<chain.length;i++){
                    const block = chain[i];
                    let rewardTransactionCount =0;
                    const transactionSet = new Set();
                    for(let transaction of block.data){
                        if(transaction.input.address === REWARD_INPUT.address){
                              rewardTransactionCount++;

                        if(rewardTransactionCount > 1) {
                            console.error('Miner Rewards Exceed limit');
                            return false;
                        }  

                        if(Object.values(transaction.outputMap)[0] !== MINING_REWARD){
                              console.log('Miner Reward amount is invalid');
                              return false;  
                        }
                        
                    }else{
                        if(!Transaction.validTransaction(transaction)){
                            console.log('invalid Transaction')
                            return false;
                        }
                        const trueBalance = Wallet.calculateBalance({
                            chain : this.chain,
                            address: transaction.input.address
                        });
                        if(transaction.input.amount !== trueBalance){
                            console.error('invlaid input amount');
                               return false; 
                        }
                        if(transactionSet.has(transaction)){
                               console.error('An identical transaction appears more than once in the block');
                               return false; 
                        }else{
                            transactionSet.add(transaction);
                        }
                    }
                }
                }
                return true;
        }
}

module.exports = Blockchain;