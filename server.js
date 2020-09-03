const
    dotenv = require('dotenv').load(),
    express = require('express'),
    logger = require('morgan'),
    mongoose = require('mongoose'),
    app = express(),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    mongoDBURL = 'mongodb://localhost/tripply',
    ejsLayouts = require('express-ejs-layouts'),
    tripsRoutes = require('./routes/trips.js'),
    usersRoutes = require('./routes/users.js'),
    session = require('express-session'),
    MongoDBStore = require('connect-mongodb-session')(session),
    flash = require('connect-flash'),
    passport = require('passport'),
    passportConfig = require('./config/passport.js'), 
    methodOverride = require('method-override'),
    yelp = require('yelp-fusion'),
    request = require('request'),
    argv = require('yargs').argv,
    moment = require('moment'),
    clientId = process.env.CLIENT_ID,
    clientSecret = process.env.CLIENT_SECRET,
    yelpKey = process.env.API_Key

//weather api
const apiKey = '43e17d975597a344bebe6fabf0eefaaa'


const
    PORT = process.env.PORT || 3002,
    mongoConnectionString = process.env.MONGODB_URI || 'mongodb://localhost/tripply'

mongoose.connect(mongoConnectionString, (err) => {
    console.log(err || 'Connected to MongoDB')
})

const store = new MongoDBStore({
    uri: mongoConnectionString,
    collection: 'sessions'
})

app.set('view engine', 'ejs')
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(cookieParser())
app.use(ejsLayouts)
app.use(bodyParser.urlencoded({ extended: true }))
app.use(flash())
app.use(express.static(`${__dirname}/public`))
app.use(methodOverride('_method'))

app.use(session({
    secret: 'ssshhhhhh',
    cookie: {maxAge: 26280000000},
    resave: true,
    saveUninitialized: false,
    store: store
}))

app.use(passport.initialize())
app.use(passport.session())

app.use((req, res, next) => {
    app.locals.currentUser = req.user
    app.locals.loggedIn = !!req.user
    app.locals.showFooter = true
    next()
})

app.get('/', (req, res) => {
    //res.render({message: "The root."})

    res.render('../views/home', {showFooter: false})
})

//weather
  app.get('/weather', function (req, res) {
    res.render('weather', {weather: null, error: null});
  })
  app.get('/weather/:id', function(req, res) {
    console.log(req.params)
    let locale = req.params.id
    let url = `http://api.openweathermap.org/data/2.5/weather?q=${locale}&units=imperial&appid=${apiKey}`
    request(url, function (err, response, body) {
    // res.send(body)
        res.render('../views/weather',{ weather: JSON.parse(body) })
    })
  })

//
// app.get('/search', (req, res) => {
//     console.log(req)
//     yelp.accessToken(clientId, clientSecret).then(response => {
//         const client = yelp.client(response.jsonBody.access_token)
//         // console.log(client)
//         client.search({
//             term: req.query.term,
//             location: req.query.location
//         }).then(response => {
//             console.log(response.jsonBody.businesses);
//             res.json(response.jsonBody.businesses)
//             // res.render('../views/try', {results: response.jsonBody.businesses})
//         })
//     }).catch(e => {
//         console.log(e);
//     });
//     })

app.get('/search', (req, res) => {
    // console.log(res)
    // yelp.accessToken(clientId, clientSecret).then(response => {
        // const client = yelp.client(response.jsonBody.access_token)
        const client = yelp.client(yelpKey)
    //     // console.log(client)
        client.search({
            term: req.query.term,
            location: req.query.location
        }).then(response => {
            // console.log(response.jsonBody.businesses);
            res.json(response.jsonBody.businesses)
            // res.render('../views/try', {results: response.jsonBody.businesses})
        }).catch(e => {
            console.log(e);
        });
})

app.use('/trips', tripsRoutes)
app.use('/users', usersRoutes)


app.listen(PORT, (err) => {
    console.log(err || `Server connected on port ${PORT}`)
})