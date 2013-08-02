var mongoose = require('mongoose')
  , restify  = require('restify')
  , async    = require('async')
  , pwd      = require('pwd')
  , tokens   = require('../lib/tokens')
  , dispatch = require('../lib/dispatch')
  , User     = mongoose.model('User')

// ### Register

exports.register = function (req, res, next) {
    User.register(req.params.username, req.params.password, dispatch(res, next))
}

// ### Login

exports.login = function (req, res, next) {
    User.getToken(req.params.username, req.params.password, dispatch(res, next))
}

// ### Auth

exports.authenticate = function (req, res, next) {
    tokens.verify(req.query.token, function (err, userid) {
        if (err || !userid) {
            res.send(new restify.NotAuthorizedError)
            return
        }
        req.user = userid
        next()
    })
}

// ### Add friend

exports.addFriend = function (req, res, next) {
    User.findById(req.body.friend, function (err, friend) {
        async.parallel([
            function (callback) {
                friend.update({ $addToSet: { friends: req.user } }, callback)
            },
            function (callback) {
                User.update({ _id: req.user }, { $addToSet: { friends: friend._id } }, callback)
            }
        ], function (err, friends) {
            if (err) return next(err)
            res.send({ success: true })
        })
    })
}

// ### List friends

exports.friends = function (req, res, next) {
    User.findById(req.user, function (err, user) {
        if (err) return next(err)
        res.send(user.friends)
    })
}

// ### List common friends

exports.common = function (req, res, next) {
    var friend = req.params.friend

    async.parallel([
        function (callback) { User.findById(req.user, callback) }
      , function (callback) { User.findById(friend, callback)   }
    ], function (err, results) {
        if (err || results.length < 2) return next(err)

        var others = results[1].friends
        res.send(results[0].friends.reduce(function(common, id){
            if (others.indexOf(id) >= 0) common.push(id)
            return common
        }, []))
    })
}
