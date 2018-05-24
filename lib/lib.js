const fs = require('fs')
const BlockChain = require('../main')

const {
  getAllTrns,
  emptyAllTrns,
  addTrns,
} = require('./transaction-dal')

const loadAllFileNames = () => {
  const testFolder = './blocks/'
  const files = []
  return new Promise((resolve, reject) => {
    fs.readdir(testFolder, (err, files) => {
      files.sort()
      resolve(files)
    })
  })
}

async function getEntireBlockChain () {
  const files = await loadAllFileNames()
  let chain = []

  for (let file of files) {
    let block = require(`../blocks/${file}`)
    chain = chain.concat(block.transactions)
  }

  return chain
}

async function getUserTransactions (user) {
  const entireData = await getEntireBlockChain()
  const userData = []
  
  entireData.forEach((elem) => {
    if (elem.fromAddress === user) {
      userData.push(elem)
    }
  })

  return userData
}

async function addTransaction ({name, media}) {
  const markitmine = new BlockChain()
  
  await markitmine.loadBlockChain()
  await markitmine.createTransaction(new Transaction(name, media))
  return true
  // await getAllTrns()
}

await function mine () {
  const markitmine = new BlockChain()

  await markitmine.minePendingTransactions()
  return true
}

module.exports = {
  getUserTransactions,
  getEntireBlockChain,
  addTransaction,
  mine,
}