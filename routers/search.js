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
                    field: searchKeyword
                }
            }
        }
      });
      console.log('hits : ' + result.body.hits)
      console.log('total : ' + result.body.hits.total.value)
      console.log('keyword : ' + JSON.stringify(result.body.hits.hits[0]._source.field))

      let sendKeyword = {
        totcnt : result.body.hits.total.value,
        keyword : result.body.hits.hits
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

    searchKeyword(json.keyword).then((value)=>{
        console.log('value : ' + JSON.stringify(value))
        res.json(value)
    }).catch((error) => {
        console.log(error)
    })
    //result.then((value) => { console.log('value : ' + JSON.stringify(value))}).catch((error)=>{console.log(error)})
})
module.exports = router