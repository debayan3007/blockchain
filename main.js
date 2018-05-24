const {SHA256} = require('crypto-js')
// const { collectionFetcher } = require('./lib')
const {
  getAllTrns,
  emptyAllTrns,
  addTrns,
} = require('./lib')

// const getFailedCollection = collectionFetcher('transactions')

class Transaction {
  constructor(fromAddress, media) {
    this.media = media
    this.fromAddress = fromAddress
  }
}

class Block {
  constructor(timestamp, transactions, previousHash = '') {
    this.timestamp = timestamp
    this.transactions = transactions
    this.previousHash = previousHash
    this.hash = this.calculateHash()
    this.nonce = 0
  }

  calculateHash () {
    return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data) + this.nonce).toString()
  }

  mineBlock(difficulty = 2) {
    while (this.hash.substring(0, difficulty) !==  Array(difficulty + 1).join(0)) {
      this.nonce++
      this.hash = this.calculateHash()
    }

    console.log('block mined:', this.hash)
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()]
    this.difficulty = 2
    // get all from db
    // getAllTrns().then((transactions) => {
    //   this.pendingTransactions = transactions
    // })
  }

  createGenesisBlock() {
    return new Block('01/01/2018', 'Genesis Block', '0')
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1]
  }

  async minePendingTransactions(miningRewardAdrress) { // it will actually save the file to the hard drive and dropbox cloud storage
    // reading all from db
    this.pendingTransactions = await getAllTrns()
    let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash)
    block.mineBlock(this.difficulty)

    this.chain.push(block)

    // emptying of collection
    this.pendingTransactions = []
    await emptyAllTrns()
  }

  async createTransaction (transaction) {
    // writing to collection
    this.pendingTransactions = await addTrns(transaction)
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i]
      const previousBlock = this.chain[i - 1]

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false
      }

    }
    return true
  }
}

async function activate () {
  let markitmine = new Blockchain()
  await markitmine.createTransaction(new Transaction('debayan', '123qe123qwe')) // photo submit
  await markitmine.createTransaction(new Transaction('pratyush', '4563456123qe123qwe'))
  
  
  console.log('not mined')
  console.log(JSON.stringify(markitmine, null, 2))
  console.log('\n.\n.\n.\n.\n.\n.\n.')
  console.log('mining...')
  await markitmine.minePendingTransactions()
  await markitmine.createTransaction(new Transaction('jiten', '123123123'))
  
  console.log('Blockchain')
  console.log(JSON.stringify(markitmine, null, 2))
  console.log('\n.\n.\n.\n.\n.\n.\n.')
  
  await markitmine.minePendingTransactions()
  await markitmine.createTransaction(new Transaction('apoorva', '4563456456'))
  console.log('new block chain')
  console.log(JSON.stringify(markitmine, null, 2))
}

activate()
