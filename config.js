const INITIAL_DIFFICULTY = 3;
const MINE_RATE = 1000;
const GENISIS_DATA = {
    timestamp : 1000,
    lastHash : '______',
    hash: 'hash-one',
    difficulty : INITIAL_DIFFICULTY,
    nonce : 0,
    data :[]
};

const STARTING_BALANCE = 1000;

module.exports = { GENESIS_DATA :GENISIS_DATA , MINE_RATE: MINE_RATE, STARTING_BALANCE:STARTING_BALANCE};