assert  = require 'assert'
request = require 'superagent'
fs      = require 'fs'
qs      = require 'querystring'
util    = require './lib/util'

describe 'Images', ->

    imageId = null

    before util.getToken

    it 'should post a file', (done) ->
        request.post("#{server.url}/image")
            .query({ token: @token })
            .attach('image', "#{__dirname}/data/faces.jpg")
            .end (res) ->
                assert res.body.id
                imageId = res.body.id
                done()

    it 'should list files by user', (done) ->
        q = qs.stringify { token : @token }
        client.get "/images?#{q}", (err, req, res, images) ->
            console.log "#{server.url}/images/#{images[0]._id}"
            assert.ifError err
            assert.equal images.length, 1
            assert.equal images[0].filename, 'faces.jpg'
            done()

