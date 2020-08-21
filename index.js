require('dotenv').config()
const env = process.env.NODE_ENV
const { getUserStatus } = require('./controllers/user');
const mongoose = require('mongoose')
const config = require('./config/config')[env]
const express = require('express')
const homeRouter = require('./routes/home')
const userRouter = require('./routes/user')
const itemRouter = require('./routes/play')
const app = express()

mongoose.connect(config.databaseUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
}, (err) => {
  if (err) {
    console.error(err)
    throw err
  }

  console.log('Database is successfully connected.')
})

require('./config/express')(app)

app.use('/', homeRouter)
app.use('/', userRouter)
app.use('/', itemRouter)

app.get('*', getUserStatus, (req, res) => {
  res.render('home', {
    title: 'Error page',
    isLoggedIn : req.isLoggedIn,
    username: req.username
  })
})

app.listen(config.port, console.log(`Listening on port ${config.port}!`))