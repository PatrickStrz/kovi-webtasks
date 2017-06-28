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
//           "communityAggregate": {
//             "id": "cj4gj76xx00283k67hrlehdgm",
//             "scoreTotal": 27713
//           }
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
  const previousCommunityAggregateTotal = node.scorecard.communityAggregate.scoreTotal

  //To be used in mutation:
  const userScorecardId = node.scorecard.id
  const newScorecardTotal = previousScorecardTotal + newPoints
  const communityAggregateId = node.scorecard.communityAggregate.id
  const newCommunityAggregateTotal = previousCommunityAggregateTotal + newPoints

  console.log('newpoints:'+ newPoints)
  console.log('previousScorecardTotal:'+ previousScorecardTotal)
  console.log('previousCommunityAggregateTotal:'+ previousCommunityAggregateTotal)
  console.log('-------------------------------------------------------------------')

  const endpoint = 'https://api.graph.cool/simple/v1/cj2hsn8pvak4o0187k52n2i3l'
  // const token = 'Bearer __PERMANENT_AUTH_TOKEN__'

  const mutation = `
    mutation {
      updateScorecard(id:"${userScorecardId}", total:${newScorecardTotal}){
        id
        total
      }
      updateCommunityAggregate(id:"${communityAggregateId}",scoreTotal:${newCommunityAggregateTotal}){
        id
        scoreTotal
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
