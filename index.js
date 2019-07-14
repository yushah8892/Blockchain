const express = require('express');
const BlockChain = require('./Blockchain');
const bodyParser = require('body-parser');

const app = new express();
const blockChain = new BlockChain();

app.use(bodyParser.json());
app.get('/api/blocks',(req,res)=>{
    res.json(blockChain.chain);
});


app.post('/api/mine',(req,res)=>{
    const data = req.body;
    blockChain.addBlock({data});
    res.redirect('/api/blocks');

});
const PORT = 3000;
app.listen(PORT,()=>{
    console.log(`Listening at localhost :${PORT}`);
});