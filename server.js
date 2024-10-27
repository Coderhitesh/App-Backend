const express = require('express')
const app = express()
// require('dotenv').config()
require('dotenv').config()
const PORT = process.env.PORT || 7123;
const cors = require('cors')
const ConnectDB = require('./Config/DataBase');
const cookieParser = require('cookie-parser')
const Router = require('./Router/Routes')
const { rateLimit } = require('express-rate-limit')
// Middlewares
ConnectDB()
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 15 minutes
    limit: 200,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: "Too many Request",
    statusCode: 429,
    handler: async (req, res, next) => {
        try {
            next()
        } catch (error) {
            res.status(options.statusCode).send(options.message)
        }
    }

})

app.set(express.static('public'))
app.use('/public',express.static('public'))

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.use(limiter)
app.use('/api/v1', Router)

app.get('/', (req, res) => {
    res.send('Welcome To app Server')
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})

