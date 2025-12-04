const usersRouter = require('express').Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')



usersRouter.get('/', async (request, response) => {
    const users = await User.find({}).populate('blogs', { title: 1, author: 1, url: 1 })
    response.json(users.map(user => user.toJSON()))
})

usersRouter.post('/', async (request, response) => {
    if (!request.body.username || !request.body.password) {
        return response.status(400).json({ error: 'username and password are required' })
    }
    if (request.body.username.length < 3 || request.body.password.length < 3) {
        return response.status(400).json({ error: 'username and password must be at least 3 characters long' })
    }
    const passwordHash = await bcrypt.hash(request.body.password, 10)
    const user = new User({
        username: request.body.username,
        name: request.body.name,
        passwordHash: passwordHash
    })
    const savedUser = await user.save()
    await savedUser.populate('blogs', { title: 1, author: 1, url: 1 })
    response.status(201).json(savedUser.toJSON())
})


module.exports = usersRouter
