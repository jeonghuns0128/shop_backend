const router = require('express').Router()
const db = require('./../module/db');
const client = require('./../module/elasticSearch');
const axios = require('axios');

//mysql 버전
// router.post('/write', (req,res) => {
//     //console.log(req.body)
//     db.query(
//       'insert into board(title,content) values(?, ?)', [req.body.title, req.body.content],function(err, results, fields){
//         res.redirect(process.env.FRONT_URL + '/board')
//       }
//     )
  
//   })

router.get('/', (req, res) => {
    try {
        if(req.query.constructor === Object && Object.keys(req.query).length === 0){
          selectBoard().then((value)=>{
            res.json(value)
          }).catch((error) => {
              console.log(error)
          })  
        } else{
          let json = req.query
          selectBoardSort(json.sort).then((value)=>{
              console.log('value : ' + JSON.stringify(value))
              res.json(value)
          }).catch((error) => {
              console.log(error)
          })
        }
        
    } catch (error) {
        console.log(error)
    }
  })

  router.post('/write', (req,res) => {
    let maxId = 0
    console.log(req.body)
    try {
        selectMaxId().then((value)=>{
            maxId = value + 1
            console.log("maxId : " + maxId)
            req.body.maxId = maxId
            console.log(req.body)
            insertBoard(req.body).then((value) => {
                if(value.status == 201){
                    res.redirect(process.env.FRONT_URL + '/board')
                } else{
                    console.log('게시판 insert 에러!!!')
                }
            }).catch((error)=>{
                console.log(error)
            })

        }).catch((error) => {
            console.log(error)
        })    
    } catch (error) {
        console.log(error)
    }
  })

  router.get('/search/:keyword', (req, res) => {
    let json = req.params;

    searchBoard(json.keyword).then((value)=>{
        console.log('value : ' + JSON.stringify(value))
        res.json(value)
    }).catch((error) => {
        console.log(error)
    })
  })

  router.get('/:id', (req, res) => {
    let json = req.params
    
    selectBoardOne(json.id).then((value)=>{
        console.log('value : ' + JSON.stringify(value))
        res.json(value)
    }).catch((error) => {
        console.log(error)
    })
  })
  
  //mysql 버전
//   router.get('/', (req, res) => {
//     db.query(
//       'SELECT id, title, content, category, company, user_id, like_cnt, review_cnt, view_cnt from board',function(err, results, fields){
//         console.log(results);
//         res.json(results);
//       }
//     )
//   })

  async function selectBoardSort(num) {
    
    let sortKeyword = '' // 0 -> 좋아요순, 1 -> 리뷰순, 2 -> 조회수순
    
    console.log(num)
    switch(num) {
      case "0":
        sortKeyword = "like_cnt"
        break
      case "1":
        sortKeyword = "review_cnt"
        break
      case "2":
        sortKeyword = "view_cnt"
        break
      default:
        sortKeyword = ''
        break
    }
    
    try {
      const result =  await client.search({
          
          index: 'board',
          body: {
            query:{
              match_all: {}
              // multi_match:{
              //   query : searchKeyword, 
              //   fields : ["title.nori_discard", "content.nori_discard"]
              // }
            }, 
            sort:[
              {[sortKeyword] : "desc"}
            ]
          }
        });
        console.log('hits : ' + JSON.stringify(result.body.hits))
      //   console.log('total : ' + result.body.hits.total.value)
      //   console.log('keyword : ' + JSON.stringify(result.body.hits.hits[0]._source.field))
  
        let sendKeyword = {
          totcnt : result.body.hits.total.value,
          board : result.body.hits.hits
        }
        return sendKeyword
      } catch (err) {
        console.error(err);
      }
  }

  async function selectBoard() {
    try {
        const result = await axios.get(process.env.ELASTICSEARCH_URL + "/board/_search")
        
        let sendBoard = {
            totcnt : result.data.hits.total.value,
            board : result.data.hits.hits
          }

        return sendBoard
    } catch (err) {
      console.error(err);
    }
  }

  async function selectBoardOne(num) {
    try {
        const result = await axios.get(process.env.ELASTICSEARCH_URL + "/board/_doc/" + num)
        return result.data._source
    } catch (err) {
      console.error(err);
    }
  }

  async function selectMaxId(){
    try {
        const result = await axios.get(process.env.ELASTICSEARCH_URL + "/board/_search")
        console.log("maxId : " + result.data.hits.total.value)
        return result.data.hits.total.value 
    } catch (error) {
        console.log(error)
    }
  }

  async function insertBoard(data){
    try {
        const result = await axios.put(process.env.ELASTICSEARCH_URL + "/board/_doc/" + data.maxId, {
            title: data.title,
            content: data.content
        })
        console.log('elasticsearch put 성공')
        console.log(result)
        return result
    } catch (error) {
        console.log(error)
    }
  }

  async function searchBoard(keyword) {
    let searchKeyword = keyword
    console.log('searchKeyword : ' + searchKeyword)
    try {
    const result =  await client.search({
        
        index: 'board',
        body: {
          query:{
            multi_match:{
              query : searchKeyword, 
              fields : ["title.nori_discard", "content.nori_discard"]
            }
          }
        }
      });
      console.log('hits : ' + JSON.stringify(result.body.hits))
    //   console.log('total : ' + result.body.hits.total.value)
    //   console.log('keyword : ' + JSON.stringify(result.body.hits.hits[0]._source.field))

      let sendKeyword = {
        totcnt : result.body.hits.total.value,
        keyword : result.body.hits.hits
      }
      return sendKeyword
    } catch (err) {
      console.error(err);
    }
  }


module.exports = router