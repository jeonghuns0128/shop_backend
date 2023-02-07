const router = require('express').Router()
const db = require('./../module/db');
const client = require('./../module/elasticSearch');

async function productDetail(barcode) {
  
  try {
  const result =  await client.search({
      
      index: 'product',
      body:{
          query: {
              match: {
                barcode: barcode
              }
          }
      }
    });
    console.log('hits : ' + result.body.hits)
    console.log('total : ' + result.body.hits.total.value)
    console.log('keyword : ' + JSON.stringify(result.body.hits.hits[0]._source.title))

    let sendKeyword = {
      keyword : result.body.hits.hits
    }
    return sendKeyword
  } catch (err) {
    console.error(err);
  }
}

router.get('/clothes/shoes', (req, res) => {
    db.query(
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
  
  router.get('/clothes/shoes/:id', (req, res) => {
    let json = req.params;
  
    db.query(
      'SELECT id, title, content, price, detail_info, img_url from PRODUCT WHERE `id` = ?', [json.id],function(err, results, fields){
        console.log(results);
        res.json(results);
      }
    )
  })

  router.get('/:id', (req, res) => {
    let json = req.params;
    
    productDetail(json.id).then((value)=>{
      console.log('value : ' + JSON.stringify(value))
      res.json(value)
    }).catch((error) => {
        console.log(error)
    })
  })

module.exports = router