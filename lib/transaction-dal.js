const { collectionFetcher } = require('./db')

const getTransactionCollection = collectionFetcher('transaction')


async function getAllTrns() {
  const cTransaction = await getTransactionCollection()
  let transactions = cTransaction.find({})
  transactions = await transactions.toArray()
  return transactions
}

async function emptyAllTrns() {
  const cTransaction = await getTransactionCollection()
  await cTransaction.deleteMany({})
  return []
}

async function addTrns(transaction) {
  const cTransaction = await getTransactionCollection()
  cTransaction.insert(transaction)
  let transactions = await getAllTrns()
  return transactions
}

module.exports = {
  getAllTrns,
  emptyAllTrns,
  addTrns,
}