restify = require 'restify'

global.server = require '../'

# mock route
server.get '/echo', (req, res) ->
    res.send req.query

global.client = restify.createJsonClient {
    url: 'http://localhost:8080'
}

before (done) ->
    server.listen 8080, '127.0.0.1', done

after (done) ->
    mongoose = require 'mongoose'
    mongoose.model('User').remove({}).exec(done)

