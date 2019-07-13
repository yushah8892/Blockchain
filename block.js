const {GENESIS_DATA,MINE_RATE} = require('./config');
const cryptoHash = require('./crypto-hash');
class Block{
    constructor({timestamp,lastHash,hash,data,nonce,difficulty}){
            this.timestamp = timestamp;
            this.lastHash = lastHash;
            this.hash = hash;
            this.data = data;
            this.nonce = nonce;
            this.difficulty = difficulty;
    }

    static genesis(){
       // console.log(GENESIS_DATA);
        return new this(GENESIS_DATA);
    }

    static adjustDifficulty({originalBlock,timestamp}){

        const differece =timestamp - originalBlock.timestamp;
        const {difficulty} = originalBlock;
        if(differece > MINE_RATE){
            return difficulty -1;
        }else{
            return difficulty +1 ;
        }
    }
    static mineBlock({lastBlock,data}){

            let hash,timestamp;
          //  const timestamp = Date.now();
            const lastHash = lastBlock.hash;
            const { difficulty } = lastBlock;
            let nonce = 0;
             
            do{
                nonce++;
                timestamp = Date.now();
                hash =cryptoHash(timestamp,lastHash,data,nonce,difficulty) 

            }while(hash.substring(0,difficulty) !== '0'.repeat(difficulty));
            return new  Block({
                timestamp ,
                lastHash,
                data,
                difficulty,
                nonce,
                hash
             });
    }
}

module.exports = Block;