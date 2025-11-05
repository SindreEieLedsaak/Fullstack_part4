const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const { userExtractor } = require('../utils/middleware')



blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
    response.json(blogs.map(blog => blog.toJSON()))

})


blogsRouter.post('/', userExtractor, async (request, response) => {
    if (!request.token) {
        return response.status(401).json({ error: 'token missing' })
    }
    const decodedToken = jwt.verify(request.token, process.env.SECRET)

    if (!request.body.title || !request.body.url) {
        return response.status(400).json({ error: 'title and url are required' })
    }

    const user = await User.findById(decodedToken.id)
    if (!user) {
        return response.status(401).json({ error: 'user not found' })
    }
    const blog = new Blog({ ...request.body, user: user.id })
    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    response.status(201).json(savedBlog.toJSON())
})

blogsRouter.delete('/:id', userExtractor, async (request, response) => {
    if (!request.token) {
        return response.status(401).json({ error: 'token missing' })
    }
    const blog = await Blog.findById(request.params.id)

    if (!blog) {
        return response.status(404).json({ error: 'blog not found' })
    }


    if (!blog.user) {
        return response.status(401).json({ error: 'blog has no' })
    }
    if (blog.user.toString() !== request.user.id) {
        return response.status(401).json({ error: 'unauthorized' })
    }
    await Blog.deleteOne({ _id: request.params.id })
    response.status(204).send()
})

blogsRouter.put('/:id', async (request, response) => {
    try {
        const result = await Blog.updateOne(
            { _id: request.params.id },
            { $set: request.body }
        )
        const updatedBlog = await Blog.findById(request.params.id)
        if (result.matchedCount === 0) {
            return response.status(404).json({ error: 'blog not found' })
        }
        response.status(200).json(updatedBlog.toJSON())
    }
    catch (e) {
        response.status(400).json({ error: e.message })
    }


})


module.exports = blogsRouter