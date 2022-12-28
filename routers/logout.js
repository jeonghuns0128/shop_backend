const router = require('express').Router()
const axios = require('axios');
const { json } = require('body-parser');

// 카카오 로그아웃
router.get('/kakao', (req,res)=>{
  // https://kapi.kakao/com/v1/user/logout
  try {
    //const ACCESS_TOKEN = req.session.passport.user.accessToken;
    console.log("logout : " + JSON.stringify(req.session))
    //console.log("logout2 : " + ACCESS_TOKEN)
    
    // let logout = await axios({
    //   method:'post',
    //   url:'https://kapi.kakao.com/v1/user/unlink',
    //   headers:{
    //     'Authorization': `Bearer ${ACCESS_TOKEN}`
    //   }
    // });
  } catch (error) {
    console.error(error);
    res.json(error);
  }
  // 세션 정리
  // req.logout();
  // req.session.destroy();
  
  res.redirect(process.env.FRONT_URL + '/mypage');
})

module.exports = router