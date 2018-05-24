const {
  getDb,
  collectionFetcher,
} = require('./db')

const {
  getAllTrns,
  emptyAllTrns,
  addTrns,
} = require('./transaction-dal')

module.exports = {
  getDb,
  collectionFetcher,
  getAllTrns,
  emptyAllTrns,
  addTrns,
}