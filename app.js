const dotenv = require('dotenv')
dotenv.config()
const express = require('express')
const app = express()
const parser = require('body-parser')
const passport = require('passport')
const passportJWT = require('passport-jwt')
const JWTStrategy = passportJWT.Strategy
const ExtractJWT = passportJWT.ExtractJwt
const knex = require('knex')
const knexDb = knex({client: 'pg', connection: 'postgres://localhost/jwt_test'})
const bookshelf = require('bookshelf')
const securePassword = require('bookshelf-secure-password')
const db = bookshelf(knexDb)
db.plugin(securePassword)
const jwt = require('jsonwebtoken')
// Db Model
const User = db.Model.extend({
    tableName: 'login_user',
    hasSecurePassword: true
})

const opts = {
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.SECRET_OR_KEY
}
const PORT = process.env.PORT
const strategy = new JWTStrategy(opts, (payload, next) => {
    console.log('Inside startegy')
    User.forge({id: payload.id}).fetch().then(res => {
        console.log('Inside strategy User forge  res :: => ', res)
        next(null, res)
    })
})

passport.use(strategy)
app.use(passport.initialize())
app.use(parser.urlencoded({
    extended: false
}))
app.use(parser.json())

app.get('/', (req, res) => {
    res.send('Hello World')
})

app.post('/seedUser', (req, res) => {
    console.log('req = ', req.body)
    if (!req.body.email || !req.body.password) {
        return res.status(401).send('no fields')
    }
    const user = new User({
        email: req.body.email,
        password: req.body.password
    })
    user.save().then(() => {res.status(200).send('user created')})
})

app.post('/getToken', (req, res) => {
    console.log('getTOken : ', req.body)
    if(!req.body.email || !req.body.password){
        console.log('hi')
        return res.status(401).send('Fields not set')
    }
    User.forge({email: req.body.email}).fetch().then(result => {
        if(!result){
            return res.status(401).send('user not found')
        }
        result.authenticate(req.body.password).then(user => {
            const payload = {id: user.id}
            const token = jwt.sign(payload, process.env.SECRET_OR_KEY)
            res.status(200).send(token)
        }).catch(err => {
            return res.status(401).send({err: err})
        })
    })
})

app.get('/protected', passport.authenticate('jwt', {session: false}), (req, res) => {
    res.status(200).send('I\'m protected')
})

app.listen(PORT, () => {
    console.log("server listening @ ", process.env.PORT)
})