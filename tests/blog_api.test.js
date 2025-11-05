const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const logger = require('../utils/logger')

const helper = require('./test_helper')
const Blog = require('../models/blog')
const blog = require('../models/blog')

describe('when there is initially some blogs saved', () => {
    beforeEach(async () => {
        await Blog.deleteMany({})
        for (const blog of helper.initialBlogs) {
            await api.post('/api/blogs').send(blog)
                .set('Authorization', await helper.getToken())
                .expect(201)
                .expect('Content-Type', /application\/json/)
        }
    })

    test('blogs are returned as json', async () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    test('all blogs are returned', async () => {
        const response = await api.get('/api/blogs')

        assert.strictEqual(response.body.length, helper.initialBlogs.length)
    })

    test('a specific blog is within the returned blogs', async () => {
        const response = await api.get('/api/blogs')

        const titles = response.body.map(r => r.title)
        assert(titles.includes('React patterns'))
    })

    describe('viewing a specific blog', () => {
        test('the unique identifier property of blog posts is named id', async () => {
            const response = await api.get('/api/blogs')

            const blogs = response.body
            assert(blogs.length > 0)

            blogs.forEach(blog => {
                assert(blog.id)
                assert.strictEqual(blog._id, undefined)
            })
        })
    })
    describe('addition of a new blog', () => {
        test('unauthorized user cannot add a blog', async () => {
            const newBlog = {
                title: 'async/await simplifies making async calls',
                author: 'Test Author',
                url: 'http://example.com',
                likes: 10,
            }
            await api.post('/api/blogs')
                .send(newBlog)
                .expect(401)
        })
        test('a valid blog can be added', async () => {
            const newBlog = {
                title: 'async/await simplifies making async calls',
                author: 'Test Author',
                url: 'http://example.com',
                likes: 10,
            }

            await api
                .post('/api/blogs')
                .send(newBlog)
                .set('Authorization', await helper.getToken())
                .expect(201)
                .expect('Content-Type', /application\/json/)

            const blogsAtEnd = await api.get('/api/blogs')
            assert.strictEqual(blogsAtEnd.body.length, helper.initialBlogs.length + 1)

            const titles = blogsAtEnd.body.map(b => b.title)
            assert(titles.includes('async/await simplifies making async calls'))
        })

        test('blog without likes defaults to 0', async () => {
            const newBlog = {
                title: 'Blog without likes',
                author: 'Test Author',
                url: 'http://example.com',
            }

            const response = await api
                .post('/api/blogs')
                .send(newBlog)
                .set('Authorization', await helper.getToken())
                .expect(201)
                .expect('Content-Type', /application\/json/)

            assert.strictEqual(response.body.likes, 0)
        })

        test('blog without titile or url yeilds 400', async () => {
            const newBlog = {
                author: 'Test Author',
                likes: 10,
            }
            await api
                .post('/api/blogs')
                .send(newBlog)
                .set('Authorization', await helper.getToken())
                .expect(400)


        })
    })
    describe('identifier is named id', () => {
        test('the unique identifier property of blog posts is named id', async () => {
            const response = await api.get('/api/blogs')
            assert.strictEqual(response.body[0]._id, undefined)
        })
    })
    describe('deletion of a blog', () => {
        test('deletion of a blog by id', async () => {
            const blogs = await helper.blogsInDb()
            const prevNumBlogs = blogs.length
            const blogToBeDeleted = blogs[0]
            logger.info(blogToBeDeleted)
            await api.delete(`/api/blogs/${(blogToBeDeleted.id)}`)
                .set('Authorization', await helper.getToken())
            const newNumBlogs = (await helper.blogsInDb()).length
            assert.strictEqual(newNumBlogs, prevNumBlogs - 1)
        })
    })
    describe('update a blog', () => {
        test('update blog by id', async () => {
            const blogs = await helper.blogsInDb()
            const blogToBeUpdated = blogs[0]
            const newBlog = {
                title: 'updated title',
                author: 'updated author',
                url: 'http://example.com',
                likes: 10,
            }
            const response = await api.put(`/api/blogs/${(blogToBeUpdated.id)}`).send(newBlog)
            assert.strictEqual(response.body.title, 'updated title')
            assert.strictEqual(response.body.author, 'updated author')
            assert.strictEqual(response.body.url, 'http://example.com')
            assert.strictEqual(response.body.likes, 10)
        })
    })
})

after(async () => {
    await mongoose.connection.close()
})
