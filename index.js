const express = require('express');
const request = require('request');
const BlockChain = require('./blockchain');
const bodyParser = require('body-parser');
const PubSub = require('./app/pubsub');
const TransactionPool = require('./wallet/transaction-pool');
const Wallet = require('./wallet');

const app = new express();
const blockChain = new BlockChain();
const transactionPool = new TransactionPool();
const pubsub = new PubSub({blockChain, transactionPool});

const wallet = new Wallet();
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

app.post('/api/transact',(req,res)=>{
    const {amount,recipient} = req.body;
    let transaction =  transactionPool.existingTransaction({inputAddress:wallet.publicKey}) ;
    try{
        if(transaction){
            transaction.update({senderWallet:wallet,recipient,amount});
        }else{
            transaction = wallet.createTransaction({recipient,amount});
        }
    }catch(error){
            return res.status(400).json({type:'error',message:error.message});
    }
    transactionPool.setTransaction(transaction);
    pubsub.broadcastTransaction(transaction);
    res.json({type:'success',transaction});    

});

app.get('/api/transaction-pool',(req,res)=>{
    res.json(transactionPool.transactionMap);
});

let PEER_PORT;

if(process.env.GENERATE_PEER_PORT === 'true'){
    PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);

}


const syncWithRootState = ()=>{
    request({url:`${ROOT_NODE_ADDRESS}/api/blocks`},(error,response,body)=>{
   
        if(!error && response.statusCode ===200){
                const rootChain = JSON.parse(body);
                console.log('replace chain on a sync with',rootChain);  
                blockChain.replaceChain(rootChain);
        }
});

   request({url:`${ROOT_NODE_ADDRESS}/api/transaction-pool`},(error,response,body)=>{
        if(!error && response.statusCode === 200){
           const rootTransactionPool =JSON.parse(body);
           console.log('replace transaction pool on a sync with',rootTransactionPool);
           transactionPool.setMap(rootTransactionPool); 
        }
   }); 
}
const PORT = PEER_PORT || DEFAULT_PORT;
app.listen(PORT,()=>{
    console.log(`Listening at localhost :${PORT}`);

    if(PORT !== DEFAULT_PORT){
        syncWithRootState();
}
 
});