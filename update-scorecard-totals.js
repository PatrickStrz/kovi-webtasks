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
