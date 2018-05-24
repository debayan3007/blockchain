const { MongoClient } = require('mongodb')
const credentials = require('./credentials')

const { url: dbUrl } = credentials('mongodb')

const dbPromise = MongoClient
  .connect(dbUrl)
  .catch((e) => {
    console.log(e)
    process.exit(1)
  })

const getDb = function getDb() {
  return dbPromise
}

const collectionFetcher = collection => async () => {
  const db = await getDb()
  return db.collection(collection)
}

module.exports = {
  getDb,
  collectionFetcher,
}
