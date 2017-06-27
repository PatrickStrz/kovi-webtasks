const request = require('request')

module.exports = (context, cb) => {

  const node = context.body.data.Score.node
  const newPoints = node.value
  const previousUserScorecardTotal = node.scorecard.total
  const previousCommunityScorecardTotal = node.scorecard.communityMeta.total

  //To be used in mutation:
  const userScorecardId = node.scorecard.id
  const newUserScorecardTotal = previousUserScorecardTotal + newPoints
  const communityScorecardId = node.scorecard.communityMeta.id
  const newCommunityScorecardTotal = previousCommunityScorecardTotal + newPoints

  console.log('newpoints:'+ newPoints)
  console.log('previousUserScorecardTotal:'+ previousUserScorecardTotal)
  console.log('previousCommunityScorecardTotal:'+ previousCommunityScorecardTotal)
  console.log('--------------------------------------------------')
  console.log('running')

  const endpoint = 'https://api.graph.cool/simple/v1/cj227dcizzdoo0164hyn8cef7'
  // const token = 'Bearer __PERMANENT_AUTH_TOKEN__'

  const mutation = `mutation {
    updateScorecard(id:"${userScorecardId}", total:${newUserScorecardTotal}){
      id
      total
    }
    updateCommunityMeta(id:"${communityScorecardId}",total:${newCommunityScorecardTotal}){
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
