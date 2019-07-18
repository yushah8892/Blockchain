const uuid = require('uuid/v1');
const {verifySignature} = require('../util');
const {REWARD_INPUT,MINING_REWARD} = require('../config');

class Transaction {
    constructor({senderWallet,recipient,amount,outputMap,input}){
        this.id = uuid();
        this.outputMap = outputMap || this.createOutputMap({senderWallet,recipient,amount});
        this.input  = input ||this.createInput({senderWallet,outputMap:this.outputMap});
        
    }

    createOutputMap({senderWallet,recipient,amount}){
        const outputMap = {};
        outputMap[recipient] = amount;
        outputMap[senderWallet.publicKey] = senderWallet.balance - amount;
        return outputMap;
    }

    createInput({senderWallet,outputMap}){

        return {
            timestamp: Date.now(),
            amount : senderWallet.balance,
             address : senderWallet.publicKey,
            signature : senderWallet.sign(outputMap)
        };
    }

    static validTransaction(transaction){
            const {input : {address,amount,signature} , outputMap} = transaction;
         //   console.log(outputMap);
            const totalAmount = Object.values(outputMap).reduce((total,output)=>total + output );

            if(amount !== totalAmount){
                console.error(`Invalid Transaction from ${address}`);
                return false;
            }

            if(!verifySignature({
                   publicKey : address,
                   data: outputMap,
                signature 
            })) {
                console.error(`Invalid Signature from ${address}`);

                return false;
            }
            return true;
    }

    update({senderWallet,recipient,amount}){

            if(amount > this.outputMap[senderWallet.publicKey]){
                throw new Error('Amount Exceeds Balance');
            }
            if(!this.outputMap[recipient]){
                    this.outputMap[recipient] = amount;
            }else{
                this.outputMap[recipient] = this.outputMap[recipient] + amount;
            }
            this.outputMap[senderWallet.publicKey] = this.outputMap[senderWallet.publicKey] - amount;
            this.input = this.createInput({senderWallet,outputMap:this.outputMap});
    }

    static rewardTransaction({minerWallet}){
            return new Transaction({
                input : REWARD_INPUT,
                outputMap : {[minerWallet.publicKey]: MINING_REWARD}
            });
    }
}

module.exports = Transaction;