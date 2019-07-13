const cryptoHash = require('./crypto-hash');
describe('cryptoHash()',()=>{
    

    it('generates a SHA256 output',()=>{
        expect(cryptoHash('foo')).toEqual('2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae');
    });

    it('generates a same hash for arguments passed in different order',()=>{
        expect(cryptoHash('one','two','three')).toEqual(cryptoHash('three','one','two'));
    });


});