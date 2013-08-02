assert = require 'assert'
qs     = require 'querystring'

random = -> (Math.floor Math.random() * 1e8).toString(32)

describe 'Authentication', ->

    userData = {
        username: "#{random()}@test.com"
        password: random()
    }

    assertUser = (done) ->
        return (err, req, res, obj) ->
            assert.ifError err
            assert obj.token 
            assert obj.token.length >= 32 # 16 bytes
            assert.equal obj.username, userData.username
            done()

    it 'should register a new user and return a token', (done) ->
        client.post '/register', userData, assertUser(done)

    it 'should login a user and return new a token', (done) ->
        client.post '/login', userData, assertUser(done)

    it 'should forbid access without a token', (done) ->
        q = qs.stringify { test: 1 }
        client.get '/echo?#{q}', (err, req, res, obj) ->
            assert err
            assert.equal err.statusCode, 403
            assert.equal err.name, 'NotAuthorizedError'
            done()

    it 'should allow access with a token', (done) ->
        client.post '/login', userData, (err, req, res, obj) ->
            assert obj.token
            q = qs.stringify { test: 1, token: obj.token }
            client.get "/echo?#{q}", (err, req, res, obj) ->
                assert.ifError err
                assert.equal qs.stringify(obj), q
                done()
