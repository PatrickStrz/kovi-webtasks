'use latest';
 //so use es6

// This webtask is called from a graphcool server side subscription with an event in the
//shape of:
// {
//   "data": {
//     "Score": {
//       "updatedFields": [
//         "updatedAt"
//       ],
//       "node": {
//         "id": "cj4gj76xx00263k67blnld42q",
//         "value": 18680,
//         "scorecard": {
//           "id": "cj4gj76xx00273k67n5si4vgt",
//           "total": 9766,
//         }
//       }
//     }
//   }
// }
//This function updates a user's Scorecard as well as the community aggregate score in response to a new score event 

const request = require('request')

module.exports = (context, cb) => {
  // console.log('headers:'+JSON.stringify(context.headers))


  // environment dependent variables:
  const env = context.headers.env
  
  let endpoint
  let authToken
  
  if (env == 'production'){
    endpoint = context.secrets.KOVI_PRODUCTION_ENDPOINT
    authToken = context.secrets.PRODUCTION_PERMANENT_AUTH_TOKEN
    console.log('----- PRODUCTION FUNCTION INVOCATION -----')
  }
  
  else if (env == 'dev'){
    endpoint = context.secrets.KOVI_DEV_ENDPOINT
    authToken = context.secrets.DEV_PERMANENT_AUTH_TOKEN
    console.log('----- DEV FUNCTION INVOCATION -----')
  }
  
  const node = context.body.data.Score.node
  const newPoints = node.value
  const previousScorecardTotal = node.scorecard.total

  //To be used in mutation:
  const userScorecardId = node.scorecard.id
  const newScorecardTotal = previousScorecardTotal + newPoints

  console.log('scorecard:'+userScorecardId)
  console.log('newpoints:'+ newPoints)
  console.log('previousScorecardTotal:'+ previousScorecardTotal)
  console.log('newScorecardTotal:'+ newScorecardTotal)
  console.log('-------------------------------------------------------------------')


  const mutation = `
    mutation {
      updateScorecard(id:"${userScorecardId}", total:${newScorecardTotal}){
        id
        total
      }
    }`
    
   request.post({
    url: endpoint,
    headers: {
      'content-type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    },
    body: JSON.stringify({query: mutation}),
  }).on('error', (e) => {
    console.log('Error updating scorecards: ' + e.toString())
    cb(e, {error: e.toString()})
  }).on('data', (response) => {
    console.log(JSON.parse(response))
    cb(null, {response: JSON.parse(response).data})
  })
}
