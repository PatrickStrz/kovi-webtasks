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
  const node = context.body.data.Score.node
  const newPoints = node.value
  const previousScorecardTotal = node.scorecard.total

  //To be used in mutation:
  const userScorecardId = node.scorecard.id
  const newScorecardTotal = previousScorecardTotal + newPoints

  console.log('newpoints:'+ newPoints)
  console.log('previousScorecardTotal:'+ previousScorecardTotal)
  console.log('-------------------------------------------------------------------')

  const endpoint = 'https://api.graph.cool/simple/v1/cj541g35wjwqc01754kb4rfvk'

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
      // 'Authorization' : token,
      'content-type': 'application/json',
    },
    body: JSON.stringify({query: mutation}),
  }).on('error', (e) => {
    console.log('Error updating scorecards: ' + e.toString())
    cb(e, {error: e.toString()})
  }).on('data', (response) => {
    console.log(JSON.parse(response).data)
    cb(null, {response: JSON.parse(response).data})
  })
}
