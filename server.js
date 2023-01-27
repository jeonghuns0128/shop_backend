const express = require('express')
const app = express()
const port = 3000
const path = require('path')

const axios = require('axios');
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const KakaoStrategy = require('passport-kakao').Strategy
const session = require('express-session')
var cors = require('cors');

//require('dotenv').config()

let configPath;

switch (process.env.NODE_ENV) {
  case "prod":
    configPath = `${__dirname}/config/.env.production`;
    break;
  case "dev":
    configPath = `${__dirname}/config/.env.development`;
    break;
  case "local":
    configPath = `${__dirname}/config/.env.local`;
    console.log("configPath : " +  configPath)
  default:
    configPath = `${__dirname}/config/.env.local`;
}
require('dotenv').config({ path: configPath }); // path 설정

// MongoClient.connect(process.env.MONGODB_URL, function(err, client){
//   if(err){
//     return console.log(err)
//   } 
//   console.log('성공')
// }) 

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
  console.log('process.env.NODE_ENV : ' + process.env.NODE_ENV)
})

app.use(express.json());
app.use(cors(
  { 
    //origin : process.env.FRONT_URL,
    origin : true,
    credentials : true
  }));
app.use(bodyParser.urlencoded({extended : true}))
app.use(express.static(path.join(__dirname, 'shop/build')));

app.use(session({secret : '!rjator', resave : false, saveUninitialized : true, cookie :{
  maxAge : 24 * 60 * 60 * 1000,
  httpOnly : false,
  secure : false
}}))
app.use(passport.initialize())
app.use(passport.session())

app.use('/auth', require('./routers/auth.js'))
app.use('/logout', require('./routers/logout.js'))
app.use('/login', require('./routers/login.js'))
app.use('/cart', require('./routers/cart.js'))
app.use('/board', require('./routers/board.js'))
app.use('/product', require('./routers/product.js'))
app.use('/search', require('./routers/search.js'))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'shop/build/index.html'));
})

app.get('/mypage', loginCheck, (req, res) => {
  console.log('로그인 완료!')
  res.render(process.env.FRONT_URL + '/mypage', {user : req.user})
})

function loginCheck(req, res, next){
  if(req.user){
    console.log("request 정보 : " + req)
    next()
  } else{
    res.send('로그인 안했는데요?')
  }
}

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'shop/build/index.html'));
})


