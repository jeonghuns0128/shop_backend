const router = require('express').Router()
const client = require('./../module/elasticSearch');

async function searchKeyword(keyword) {
    let searchKeyword = keyword
    try {
    const result =  await client.search({
        
        index: 'product',
        body:{
            query: {
                match: {
                    title: searchKeyword
                }
            },
            size : 10
        }
      });
      console.log('statusCode : ' + JSON.stringify(result.statusCode))
      console.log('hits : ' + JSON.stringify(result.body.hits))
      console.log('total : ' + result.body.hits.total.value)
      //console.log('keyword : ' + JSON.stringify(result.body.hits.hits[0]._source.title))

      let sendKeyword = {
        totcnt : result.body.hits.total.value,
        keyword : result.body.hits.hits,
        statusCode : result.statusCode
      }
      
      return sendKeyword
    } catch (err) {
      console.error(err);
    }
  }

  async function selectListSort(keyword, num) {
    
    let sortKeyword = '' // 0 -> 낮은가격순, 1 -> 높은가격순, 2 -> 최신순, 3 -> 리뷰많은순
    let sort = ''

    console.log(num)
    switch(num) {
      case "0":
        sortKeyword = "sale_price"
        sort = "asc"
        break
      case "1":
        sortKeyword = "sale_price"
        sort = "desc"
        break
      case "2":
        sortKeyword = "reg_date"
        sort = "desc"
        break
      case "3":
        sortKeyword = "review_cnt"
        sort = "desc"
        break
      default:
        sortKeyword = ''
        sort = ''
        break
    }
    
    try {
      const result =  await client.search({
          
          index: 'product',
          body: {
            query:{
              match: {
                title : keyword
              }
            }, 
            sort:[
              {[sortKeyword] : sort}
            ]
          }
        });
        console.log('hits : ' + JSON.stringify(result.body.hits))
      //   console.log('total : ' + result.body.hits.total.value)
      //   console.log('keyword : ' + JSON.stringify(result.body.hits.hits[0]._source.field))
  
        let sendKeyword = {
          totcnt : result.body.hits.total.value,
          keyword : result.body.hits.hits,
          statusCode : result.statusCode
        }
        return sendKeyword
      } catch (err) {
        console.error(err);
      }
  }

  async function selectListPage(keyword, num) {
    
    let searchKeyword = keyword
    let searchNum = num * 10

    console.log("searchNum : " + searchNum)
    try {
    const result =  await client.search({
        
        index: 'product',
        body:{
            query: {
                match: {
                    title: searchKeyword
                }
            },
            from : searchNum,
            size : 10
        }
      });
      console.log('statusCode : ' + JSON.stringify(result.statusCode))
      console.log('hits : ' + JSON.stringify(result.body.hits))
      console.log('total : ' + result.body.hits.total.value)
      //console.log('keyword : ' + JSON.stringify(result.body.hits.hits[0]._source.title))

      let sendKeyword = {
        totcnt : result.body.hits.total.value,
        keyword : result.body.hits.hits,
        statusCode : result.statusCode
      }
      
      return sendKeyword
    } catch (err) {
      console.error(err);
    }
  }

//검색 시 form 전송 버전
router.post('/', (req, res) => {
    console.log('start!!!')
    searchKeyword(req.body.keyword).then((value)=>{
        console.log('value : ' + JSON.stringify(value))
        res.json(value)
    }).catch((error) => {
        console.log(error)
    })
    //result.then((value) => { console.log('value : ' + JSON.stringify(value))}).catch((error)=>{console.log(error)})
    
    console.log('end!!!')
    //    res.json(result.body.hits.total.value)
})

//검색 시 axios get 방식
router.get('/:keyword', (req, res) => {

    let json = req.params;
    
    try {
      if(req.query.constructor === Object && Object.keys(req.query).length === 0){
        searchKeyword(json.keyword).then((value)=>{
          console.log('value1 : ' + JSON.stringify(value))
          res.json(value)
        }).catch((error) => {
            console.log(error)
        })
      } else{
        if(req.query.sort !== undefined){
          let jsonSort = req.query
          selectListSort(json.keyword, jsonSort.sort).then((value)=>{
              console.log('value2 : ' + JSON.stringify(value))
              res.json(value)
          }).catch((error) => {
              console.log(error)
          })
        } else if(req.query.page !== undefined){
          let jsonPage = req.query
          selectListPage(json.keyword, jsonPage.page).then((value)=>{
              console.log('value3 : ' + JSON.stringify(value))
              res.json(value)
          }).catch((error) => {
              console.log(error)
          })
        }
      }  
    } catch (error) {
      if(error) res.status(406)
    }
    //result.then((value) => { console.log('value : ' + JSON.stringify(value))}).catch((error)=>{console.log(error)})
})
  
module.exports = router