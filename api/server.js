// implement your server here
const express = require('express')
const postsRouter = require('./posts/posts-router')

const app = express()
app.use(express.json())
app.use('/api/posts', postsRouter)

module.exports = app;
