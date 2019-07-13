
const Block = require('./block');
const GENESIS_DATA = require('./config'); 
const cryptoHash = require('./crypto-hash');
describe('Block', ()=>{
const timestamp ='01/01/01';
const lastHash = 'foo-hash';
const hash = 'bar-hash';
const data = ['blockchain','data'];

const block = new Block({
        timestamp:timestamp,
        lastHash : lastHash,
        hash:hash,
        data:data}
        );
console.log(Block);
it('has timestamp, hash, last hash and data property.',() => {
    expect(block.timestamp).toEqual(timestamp);
    expect(block.lastHash).toEqual(lastHash);
    expect(block.hash).toEqual(hash);
    expect(block.data).toEqual(data);
    

});

    describe('genesis()',() =>{
        const genesisBlock = Block.genesis();
        console.log('genesis Block ',genesisBlock);

        it('is genesis()',() =>{
            expect(genesisBlock instanceof Block).toBe(true);
        });    

        it('has genesis data',() => {
            expect(genesisBlock).toEqual(GENESIS_DATA);
        });
    });

    describe('minedBlock()',() => {
                const lastBlock = Block.genesis();
                const data = 'minded data';
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
                    expect(minedBlock.hash).toEqual(cryptoHash(minedBlock.timestamp,lastBlock.hash,data));;
                });
    });

});