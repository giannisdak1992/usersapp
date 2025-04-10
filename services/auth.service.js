const jwt = require('jsonwebtoken')
require('dotenv').config()

const { OAuth2Client } = require('google-auth-library')

function generateAccessToken(user) {
  console.log('Auth Service', user)

  const payload = {
    username: user.username,
    email: user.email,
    roles: user.roles,
  }

  const secret = process.env.TOKEN_SECRET

  const options = {
    expiresIn: '1h',
  }

  return jwt.sign(payload, secret, options)
}

function verifyAccessToken(token) {
  const secret = process.env.TOKEN_SECRET

  try {
    const payload = jwt.verify(token, secret)
    console.log('VerifyToken', payload)
    return { verified: true, data: payload }
  } catch (err) {
    return { verified: false, data: err.message }
  }
}

async function googleAuth(code) {
  console.log('Google login')
  const CLIENT_ID = process.env.GOOGLE_CLIENT_ID
  const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
  const REDIRECT_URI = process.env.REDIRECT_URI

  const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI) // initialize the result of authenticate

  try {
    //Exchange code for tokens

    const { tokens } = await oauth2Client.getToken(code) // get the token
    oauth2Client.setCredentials(tokens) // verify that is a google token

    const ticket = await oauth2Client.verifyIdToken({
      //get that token and verify that the below details coming from google
      idToken: tokens.id_token,
      audience: CLIENT_ID,
    })

    const userInfo = await ticket.getPayload() //get the payload from the token
    console.log('Google User', userInfo)
    return { user: userInfo, tokens }
  } catch (err) {
    console.log('Error in google authentication', error)
    return { error: 'Failed to authenticate with google' }
  }
}

module.exports = { generateAccessToken, verifyAccessToken, googleAuth }
