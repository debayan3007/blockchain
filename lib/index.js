const {
  getDb,
  collectionFetcher,
} = require('./db')

const {
  getAllTrns,
  emptyAllTrns,
  addTrns,
} = require('./transaction-dal')

const {
  getUserTransactions,
  getEntireBlockChain,
  addTransaction,
  mine,
} = require('./lib')

module.exports = {
  getDb,
  collectionFetcher,
  getAllTrns,
  emptyAllTrns,
  addTrns,
  getUserTransactions,
  getEntireBlockChain,
  addTransaction,
  mine,
}