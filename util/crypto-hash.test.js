const { cryptoHash }= require('../util');
describe('cryptoHash()',()=>{
    

    it('generates a SHA256 output',()=>{
        expect(cryptoHash("foo")).toEqual('b2213295d564916f89a6a42455567c87c3f480fcd7a1c15e220f17d7169a790b');
    });

    it('generates a same hash for arguments passed in different order',()=>{
        expect(cryptoHash('one','two','three')).toEqual(cryptoHash('three','one','two'));
    });

    it('produces a uique hash when the properties have changed on an input',()=>{
        const foo = {};
        console.log('calling foo cryptoshah');
        const originalHash = cryptoHash(foo);
        foo['a'] = 'a';
        expect(cryptoHash(foo)).not.toEqual(originalHash);
    });

});