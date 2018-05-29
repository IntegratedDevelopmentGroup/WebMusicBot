const express = require('express')
const router = express.Router()

const request = require('request')
const { parsed: env } = require('dotenv').load()
const url = require('url')

const client = {
  id: env.CLIENT_ID,
  secret: env.CLIENT_SECRET,
  callback: url.resolve(env.BASE_URL, '/callback'),
}

router.get('/login', (req, res) => {
  res.redirect('https://discordapp.com/oauth2/authorize'+
    `?response_type=code&client_id=${client.id}&scope=identify`+
    `&redirect_uri=${encodeURIComponent(client.callback)}`)
})

router.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/')
})

router.get('/callback', (req, res) => {
  getToken(req.query.code, data => {
    request.get({
      url: 'https://discordapp.com/api/v6/users/@me',
      headers: {
        'Authorization': 'Bearer ' + data.access_token,
      },
      json: true,
    }, (err, response, data) => {
      if (err) console.log(err)
      req.session.user = data
      res.redirect('/')
    })
  })
})

function getToken(code, callback) {
  request({
    url: 'https://discordapp.com/api/v6/oauth2/token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    formData: {
      client_id: client.id,
      client_secret: client.secret,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: client.callback,
    },
    json: true,
  }, (err, res, data) => {
    if (err) console.log(err)
    callback(data)
  })
}

module.exports = router
