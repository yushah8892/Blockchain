const cryptoHash = require('./crypto-hash');
describe('cryptoHash()',()=>{
    

    it('generates a SHA256 output',()=>{
        expect(cryptoHash('1563209783076','hash-one','minded data','1','2')).toEqual('4e6dafe7171ac5fc751f1b250e9d50f52ffdc89399a88aa384e4e6e3a4b83f97');
    });

    it('generates a same hash for arguments passed in different order',()=>{
        expect(cryptoHash('one','two','three')).toEqual(cryptoHash('three','one','two'));
    });


});