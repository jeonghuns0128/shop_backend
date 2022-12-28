const express = require('express')
const app = express()
const port = 3000
const path = require('path')
const mysql = require('mysql2');
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



MongoClient.connect(process.env.MONGODB_URL, function(err, client){
  if(err){
    return console.log(err)
  } 
  console.log('성공')
}) 

const conn = mysql.createConnection({
  host : process.env.MYSQL_HOST,
  port : process.env.MYSQL_PORT,
  user : process.env.MYSQL_USER,
  password : process.env.MYSQL_PASSWORD,
  database : process.env.MYSQL_DATABASE
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
  console.log('process.env.NODE_ENV : ' + process.env.NODE_ENV)
})

app.use(express.json());
app.use(cors(
  { 
    origin : process.env.FRONT_URL,
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

// passport.use(
//   new KakaoStrategy(
//      {
//         clientID: '58b5cdf9bd4f73d2bd0137e88df3ce48', //process.env.KAKAO_ID, // 카카오 로그인에서 발급받은 REST API 키
//         callbackURL: '/oauth/kakao', // 카카오 로그인 Redirect URI 경로
//      },
//      /*
//       * clientID에 카카오 앱 아이디 추가
//       * callbackURL: 카카오 로그인 후 카카오가 결과를 전송해줄 URL
//       * accessToken, refreshToken: 로그인 성공 후 카카오가 보내준 토큰
//       * profile: 카카오가 보내준 유저 정보. profile의 정보를 바탕으로 회원가입
//       */
//      async (accessToken, refreshToken, profile, done) => {
//         console.log('kakao profile', profile);
//         try {
//           //  const exUser = await User.findOne({
//           //     // 카카오 플랫폼에서 로그인 했고 & snsId필드에 카카오 아이디가 일치할경우
//           //     where: { snsId: profile.id, provider: 'kakao' },
//           //  });
//               const exUser = true
//            // 이미 가입된 카카오 프로필이면 성공
//            if (exUser) {
//               done(null, exUser); // 로그인 인증 완료
//            } else {
//               // 가입되지 않는 유저면 회원가입 시키고 로그인을 시킨다
//               const newUser = await User.create({
//                  email: profile._json && profile._json.kakao_account_email,
//                  nick: profile.displayName,
//                  snsId: profile.id,
//                  provider: 'kakao',
//               });
//               done(null, newUser); // 회원가입하고 로그인 인증 완료
//            }
//         } catch (error) {
//            console.error(error);
//            done(error);
//         }
//      },
//   ),
// );

// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });

// passport.deserializeUser((id, done) => {
//   //? 두번 inner 조인해서 나를 팔로우하는 followerid와 내가 팔로우 하는 followingid를 가져와 테이블을 붙인다
//   // User.findOne({ where: { id } })
//   //    .then(user => done(null, user))
//   //    .catch(err => done(err));
//   console.log('deserializeUser' )
// }); 


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'shop/build/index.html'));
})

app.get('/clothes/shoes', (req, res) => {
  conn.query(
    'SELECT id, title, content, price, img_url FROM PRODUCT limit 10',
    function(err, results, fields) {
      console.log(results); // results contains rows returned by server
      console.log(fields);
      console.log(err)
      res.json(results);
    }
  );

 // let user = req.query;
 // console.log(user);
 // res.send(user);
})

app.get('/clothes/shoes/:id', (req, res) => {
  let json = req.params;

  conn.query(
    'SELECT id, title, content, price, detail_info, img_url from PRODUCT WHERE `id` = ?', [json.id],function(err, results, fields){
      console.log(results);
      res.json(results);
    }
  )
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

app.post('/board/write', (req,res) => {
  //console.log(req.body)
  conn.query(
    'insert into board(title,content) values(?, ?)', [req.body.title, req.body.content],function(err, results, fields){
      res.redirect(process.env.FRONT_URL + '/board')
    }
  )

})

app.get('/boards', (req, res) => {
  conn.query(
    'SELECT id, title, content from board',function(err, results, fields){
      console.log(results);
      res.json(results);
    }
  )
})

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'shop/build/index.html'));
})


