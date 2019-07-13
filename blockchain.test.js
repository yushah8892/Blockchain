const Blockchain = require('./Blockchain');
const Block = require('./block');

describe('BlockChain',()=>{
    let blockchain ;
    
    beforeEach(()=>{
        blockchain = new Blockchain();
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
        console.log(blockchain.chain);
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


});