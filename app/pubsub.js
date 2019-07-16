const redis = require('redis');
const blockchain = require('../blockchain');
const  CHANNELS ={
    TEST : 'TEST',
    BLOCKCHAIN: 'BLOCKCHAIN',
    TRANSACTION : 'TRANSACTION'
};

class PubSub{
    constructor({blockChain,transactionPool}){
        this.blockchain = blockChain  ;
        this.transactionPool = transactionPool;
        this.publisher = redis.createClient();
        this.subscriber = redis.createClient();

        this.subscribeToChannels();

        this.subscriber.on('message',(channel,message)=>{
                this.handleMessage(channel,message);
        });
    }

    handleMessage(channel,message){
        const parsedMessage = JSON.parse(message);

        switch(channel){
            case CHANNELS.BLOCKCHAIN:
                    this.blockchain.replaceChain(parsedMessage);
                    break;
            case CHANNELS.TRANSACTION:
                    this.transactionPool.setTransaction(parsedMessage);
                    break;
            default: 
                    return;
        }
      console.log(`message Received:${channel}. ${message}`);

        
    }

    subscribeToChannels(){
        Object.values(CHANNELS).forEach(channels =>{
            this.subscriber.subscribe(channels);
        });
    }

    publish({channel,message}){
        this.subscriber.unsubscribe(channel,()=>{
            this.publisher.publish(channel,message,()=>{
                this.subscriber.subscribe(channel);
            });
        });
    }
    broadcastChain(){
        this.publish({
            channel:CHANNELS.BLOCKCHAIN,
            message:JSON.stringify(this.blockchain.chain)
        });
    }

    broadcastTransaction(transaction){
        this.publish({
            channel:CHANNELS.TRANSACTION,
            message:JSON.stringify(transaction)
        });
    }
}

module.exports = PubSub;