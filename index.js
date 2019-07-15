const express = require('express');
const request = require('request');
const BlockChain = require('./Blockchain');
const bodyParser = require('body-parser');
const PubSub = require('./pubsub');

const app = new express();
const blockChain = new BlockChain();
console.log(blockChain);
const pubsub = new PubSub({blockChain});
const DEFAULT_PORT = 3000;

const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;


app.use(bodyParser.json());
app.get('/api/blocks',(req,res)=>{
    res.json(blockChain.chain);
});


app.post('/api/mine',(req,res)=>{
    const data = req.body;
    blockChain.addBlock(data);
    pubsub.broadcastChain();
    res.redirect('/api/blocks');

});

let PEER_PORT;

if(process.env.GENERATE_PEER_PORT === 'true'){
    PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);

}

const PORT = PEER_PORT || DEFAULT_PORT;
app.listen(PORT,()=>{
    console.log(`Listening at localhost :${PORT}`);

    if(PORT !== DEFAULT_PORT){
        request({url:`${ROOT_NODE_ADDRESS}/api/blocks`},(error,response,body)=>{
   
            if(!error && response.statusCode ===200){
                    const rootChain = JSON.parse(body);
                    console.log('replace chain on a sync with',rootChain);  
                    blockChain.replaceChain(rootChain);
            }
    });
}
 
});