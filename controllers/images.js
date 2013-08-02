var mongoose = require('mongoose')
  , GridFS   = require('gridfs-stream')
  , fs       = require('fs')
  , dispatch = require('../lib/dispatch')

var gfs = GridFS(mongoose.connection.db)

// ### List images by user

exports.findByUser = function (req, res, next) {
    gfs.collection('images').find({ 'metadata.user': req.user }).toArray(dispatch(res, next))
}

// ### File upload
// Ideally it should disable restify's body parser and stream directly into GridFS

exports.upload = function (req, res, next) {
    var file = req.files.image
      , options, store, s

    options = {
        filename     : file.name
      , content_type : file.type
      , root         : 'images'
      , metadata     : { user: req.user }
    }
    
    store = gfs.createWriteStream(options)
    store.on('close', function(file){
        res.send({ id: file._id })
    })

    fs.createReadStream(file.path).pipe(store)
}

// ### Display image

exports.display = function (req, res, next) {
    gfs.createReadStream({
        root: 'images'
      , _id: req.params.id
    }).pipe(res)
}
