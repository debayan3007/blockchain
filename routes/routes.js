const {
  getAllTrns,
  getEntireBlockChain,
} = require('../lib')

getAllTrns().then(console.log).catch(console.log)

getEntireBlockChain().then(console.log).catch(console.log)