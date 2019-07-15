const Blockchain = require('./Blockchain');

const blockChain = new Blockchain();


blockChain.addBlock({data:'initital Block'});


let prevTimestamp,nextTimestamp,timeDiff,nextBlock,avgTime;

const times = [];

for(let i=0;i<10000;i++){

    prevTimestamp = blockChain.chain[blockChain.chain.length-1].timestamp;

    blockChain.addBlock({data:`block ${i}`});

    nextBlock = blockChain.chain[blockChain.chain.length-1];
    nextTimestamp = nextBlock.timestamp;

    timeDiff = nextTimestamp - prevTimestamp;
    times.push(timeDiff);

    avgTime = times.reduce((result,num)=>(result+num)/times.length);

    console.log(`Time to mine Block :${timeDiff}ms. Difficuly is :${nextBlock.difficulty}. avarage Time is :${avgTime}`);
}
