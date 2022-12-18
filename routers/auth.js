const router = require('express').Router()
const { json } = require('body-parser');
const passport = require('passport')
const KakaoStrategy = require('passport-kakao').Strategy

passport.use('kakao', new KakaoStrategy({
    clientID: process.env.KAKAO_CLIENT_id,
    callbackURL: process.env.KAKAO_REDIRECT_URL,     // 위에서 설정한 Redirect URI
    session : true
  }, async (accessToken, refreshToken, profile, done) => {
    console.log(profile);
    console.log(accessToken);
    console.log(refreshToken);

    // try {
    //       //db 조회
      
    // } catch (e) {
    //   console.error(e)
    //   done(e)
    // }

    let user = {
      profile: profile._json,
      accessToken: accessToken
    }
    return done(null, user)
  }))

passport.serializeUser(function (user, done) {
  console.log('serialize')
  console.log(`user : ${user.profile.id}`)
  console.log(`accessToken : ${user.accessToken}`)
  done(null, 
    { id : user.profile.properties.nickname,
      accessToken : user.accessToken})
})

passport.deserializeUser(function (user, done) {
  console.log('deserialize : ' + JSON.stringify(user))
  console.log(`user : ${user}`)
  done(null, user)
})

router.get('/kakao', passport.authenticate('kakao'))

router.get('/kakao/callback',
  //? 그리고 passport 로그인 전략에 의해 kakaoStrategy로 가서 카카오계정 정보와 DB를 비교해서 회원가입시키거나 로그인 처리하게 한다.
  passport.authenticate('kakao', {
     failureRedirect: '/', // kakaoStrategy에서 실패한다면 실행
  }),
  // kakaoStrategy에서 성공한다면 콜백 실행
  (req, res) => {
    console.log("테스트 : " + JSON.stringify(req.user))
  
    //let result = encodeURIComponent(req.user.profile.properties.nickname)
    res.redirect('http://localhost:3002/mypage/');
    
    //리다이렉트시 json으로 데이터 전송 해야함
  },
);



// router.get('/kakao', (req, res) => {

//     let code = req.query.code;
//     let nickname = ''
//     let profile_image_url = ''
  
//     try{
//         axios.post(
//             `${process.env.KAKAO_OAUTH_TOKEN_API_URL}?grant_type=${process.env.KAKAO_GRANT_TYPE}&client_id=${process.env.KAKAO_CLIENT_id}&redirect_uri=${process.env.KAKAO_REDIRECT_URL}&code=${code}`
//             , {
//              headers: {
//                 'Content-type': 'application/x-www-form-urlencoded;charset=utf-8'
//             }
//         }).then((result)=>{
//             console.log(result.data['access_token'])
//             // 토큰을 활용한 로직을 적어주면된다.
//             const ACCESS_TOKEN = result.data['access_token']
//             axios.get(`${process.env.KAKAO_USER_URL}`, {
//               headers: {
//                 'Authorization': `Bearer ${ACCESS_TOKEN}`,
//                 'Content-type': 'application/x-www-form-urlencoded;charset=utf-8'
//               }
//             }).then((result)=>{
//               console.log(result.data['id'])
//               console.log(result.data['kakao_account']['profile']['nickname'])
//               console.log(result.data['kakao_account']['profile']['profile_image_url'])
  
//               nickname = result.data['kakao_account']['profile']['nickname']
//               profile_image_url = result.data['kakao_account']['profile']['profile_image_url']
              
//               let loginData = [{
//                 'nickname' : nickname,
//                 'profile_image_url' : profile_image_url 
//               }]
  
//               //main페이지로 리다이렉트 후 json 결과 session에 저장
//               res.redirect('http://localhost:3002/mypage')
//             }).catch(e=> {
//               console.log(e)
//               res.send(e);
//             })
  
//         }).catch(e=> {
//             console.log(e)
//             res.send(e);
//         })
//     }catch(e){
//         console.log(e)
//         res.send(e);
//     }
  
//   })

module.exports = router