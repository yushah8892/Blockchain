const redis = require('redis');
const blockchain = require('../blockchain');
const  CHANNELS ={
    TEST : 'TEST',
    BLOCKCHAIN: 'BLOCKCHAIN'
};

class PubSub{
    constructor({blockChain}){
        this.blockchain = blockChain  ;
        this.publisher = redis.createClient();
        this.subscriber = redis.createClient();

        this.subscribeToChannels();

        this.subscriber.on('message',(channel,message)=>{
                this.handleMessage(channel,message);
        });
    }

    handleMessage(channel,message){
        const parsedMessage = JSON.parse(message);

        if(channel === CHANNELS.BLOCKCHAIN){
                this.blockchain.replaceChain(parsedMessage);
        }
        console.log(`Message Received. Channel:${channel}. Message:${message}`);
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
}

module.exports = PubSub;