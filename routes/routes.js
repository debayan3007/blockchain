const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const api = require('instagram-node').instagram()
const http = require('../lib/xrequest')
const redirect_uri = 'http://77b20c4a.ngrok.io/handleauth'
const {
  getAllTrns,
  getEntireBlockChain,
  getUserTransactions,
  addTransaction,
} = require('../lib')

api.use({
    client_id: '52c48c5036a7495fa21dea9e6d5fd672',
    client_secret: '95d228b4732c4774bf7862f1c9135656',
  })
  
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: false,
}))

app.get('/', (req, res) => {
    res.send('Server is working well ...')
  })
  
  // This is where you would initially send users to authorize
  app.get('/authorize_user', (req, res) => {
    res.redirect(
      api.get_authorization_url(redirect_uri, {
        scope: ['likes', 'public_content'],
        state: 'a state',
      })
    )
  })
  
  // This is your redirect URI
  app.get('/handleauth', (req, res) => {
    api.authorize_user(req.query.code, redirect_uri, (err, result) => {
      if (err) {
        res.send("Didn't work")
      } else {
        console.log('Yay! Access token is ' + result.access_token)
        res.send(result.access_token)
      }
    })
  })
  
  app.post('/instapictures', (req, res) => {
    // create a new instance of the use method which contains the access token gotten
    console.log('---------->', req.body.accesstoken)
    const url = `https://api.instagram.com/v1/tags/mark_it_mine/media/recent?access_token=${req.body.accesstoken}`
    http
      .url(url, true)
      .get()
      .then(result => {
        console.log('---------', result.content)
        res.send(result.content)
      })
  })
  

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