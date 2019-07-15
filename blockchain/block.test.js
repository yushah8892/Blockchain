
const Block = require('./block');
const {GENESIS_DATA,MINE_RATE} = require('../config'); 
const cryptoHash = require('../util/crypto-hash');
const hexToBinary = require('hex-to-binary');


describe('Block', ()=>{
const timestamp =1000;
const lastHash = 'foo-hash';
const hash = 'bar-hash';
const nonce = 0;
const difficulty = 3;
const data = ['blockchain','data'];

const block = new Block({
        timestamp:timestamp,
        lastHash : lastHash,
        hash:hash,
        data:data,
        nonce : nonce,
        difficulty : difficulty
    }
        );
//console.log(Block);
it('has timestamp, hash, last hash and data property.',() => {
    expect(block.timestamp).toEqual(timestamp);
    expect(block.lastHash).toEqual(lastHash);
    expect(block.hash).toEqual(hash);
    expect(block.data).toEqual(data);
    expect(block.nonce).toEqual(nonce);
    expect(block.difficulty).toEqual(difficulty);
    

});

    describe('genesis()',() =>{
        const genesisBlock = Block.genesis();

        it('is genesis()',() =>{
            expect(genesisBlock instanceof Block).toBe(true);
        });    

        it('has genesis data',() => {
            expect(genesisBlock).toEqual(GENESIS_DATA);
        });
    });

    describe('minedBlock()',() => {
                const lastBlock = Block.genesis();
                const data = 'minded-data';
                const minedBlock =  Block.mineBlock({lastBlock,data});

                it('is Block',() =>{
                    expect(minedBlock instanceof Block).toBe(true);
                });

                it('set the `lastHash` to be equal to `hash` of the last Block',() =>{
                    expect(lastBlock.hash).toEqual(minedBlock.lastHash);
                });
                it('sets the data',()=>{
                    expect(minedBlock.data).toEqual(data);
                });        
                it('sets a timestamp',()=>{
                    expect(minedBlock.timestamp).not.toEqual(undefined);     
                });

                it('creates a SHA-256 `hash` based on proper inputs',()=>{
                    expect(minedBlock.hash).toEqual(cryptoHash(minedBlock.timestamp,lastBlock.hash,data,minedBlock.nonce,minedBlock.difficulty));;
                });

                it('meets the difficulty criteria',()=>{
                  
                    expect(hexToBinary(minedBlock.hash).substring(0,minedBlock.difficulty)).toEqual('0'.repeat(minedBlock.difficulty));
                });

                it('adjust the difficulty',()=>{
                    const possibleResults = [lastBlock.difficulty+1,lastBlock.difficulty-1];
                    expect(possibleResults.includes(minedBlock.difficulty)).toBe(true);
                });


    });

    describe('adjustMineRate()',()=>{


        it('raised the difficulty if blocks are mined fastly',()=>{
            expect(Block.adjustDifficulty({
                originalBlock:block,
                timestamp : block.timestamp+MINE_RATE-100
            })).toEqual(block.difficulty +1);
        });
    

    it('decrease the difficulty if blocks are mined slowly',()=>{
        expect(Block.adjustDifficulty({
            originalBlock:block,
            timestamp:block.timestamp+MINE_RATE+100
        })).toEqual(block.difficulty-1);
    });
    
    it('has the lower limit ',()=>{
        block.difficulty = -1;
        expect(Block.adjustDifficulty({originalBlock:block})).toEqual(1);

    });
});


    
});