var restify  = require('restify')
  , mongoose = require('mongoose')
  , Grid = require('gridfs-stream')

// Database
// ----------------------------------------------------------------------------

mongoose.connect('mongodb://localhost/apitest')
Grid.mongo = mongoose.mongo

require('./models/user')


// HTTP Server
// ----------------------------------------------------------------------------

var server = restify.createServer({
    /* https cert/key */
})

server.use([
    restify.queryParser({ mapParams: false })
  , restify.bodyParser()
])


// Routes
// ----------------------------------------------------------------------------

var users  = require('./controllers/users')
  , images = require('./controllers/images')

server.post('/register', users.register)
server.post('/login', users.login)

server.get('/images/:id', images.display)

// Require auth for every following method
server.use(users.authenticate)

server.post('/image', images.upload)
server.get('/images', images.findByUser)

server.post('/friend', users.addFriend)
server.get('/friends', users.friends)
server.get('/friends/common/:friend', users.common)


// Start up
// ----------------------------------------------------------------------------

module.exports = server

if (!module.parent) {
    server.listen(8080, function(){
        console.log('%s listening at %s', server.name, server.url);
    })
}
