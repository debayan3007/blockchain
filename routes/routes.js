const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const {
  getAllTrns,
  getEntireBlockChain,
  getUserTransactions,
  addTransaction,
} = require('../lib')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: false,
}))

app.get('/pendingtransactions', (req, res) => {
    getAllTrns().then(trns=>{
        res.send(trns)
    })
  })

  app.get('/entireblockChain', (req, res) => {
    getEntireBlockChain().then(trns=>{
        res.send(trns)
    })
  })

  app.get('/usertransactions', (req, res) => {
      let userid = req.query.userid
    getUserTransactions(userid).then(trns=>{
        res.send(trns)
    })
  })

  app.post('/addtransaction', (req, res) => {
    let trns = { name: req.body.name, media: req.body.media }
    addTransaction(trns).then(trns=>{
      res.send(trns)
  })
})

  app.listen(3001, () => {
    console.log('app listening on port 3001!')
  })