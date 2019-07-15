const Block = require('./block');
const cryptoHash = require('./crypto-hash');

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

        replaceChain(chain){
                if(chain.length < this.chain.length){
                    console.error('new chain length must be greater then current length of chain');
                        return;
                }
                if(!Blockchain.isValidChain(chain)){
                    console.error('new chain must be a valid chain');
                    return;
                }
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
                    console.log('hash is not valid');
                        return false;
                }

                const validateHash = cryptoHash(timestamp,lastHash,data,nonce,difficulty);

                if(hash !== validateHash){
                    console.log('current hash is not valid');
                        return false;
                }
            }

            return true;
        }

}

module.exports = Blockchain;