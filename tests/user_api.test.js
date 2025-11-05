const supertest = require('supertest')

const { describe, test, beforeEach, after } = require('node:test')
const assert = require('node:assert')
const app = require('../app')
const api = supertest(app)
const helper = require('./user_test_helper')
const User = require('../models/user')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')

describe('when there is initially some users saved', () => {
    beforeEach(async () => {
        await User.deleteMany({})
        for (const user of helper.initialUsers) {
            await api.post('/api/users').send(user)
                .expect(201)
                .expect('Content-Type', /application\/json/)
        }
    })
    test('users are returned as json', async () => {
        await api
            .get('/api/users')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })
    test('all users are returned', async () => {
        const response = await api.get('/api/users')
        assert.strictEqual(response.body.length, helper.initialUsers.length)
    })
    test('a user with no username or password is not created', async () => {
        const newUser = {
            name: 'Test User',
            password: 'testpassword'
        }
        await api.post('/api/users').send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)
            .expect(response => {
                assert.strictEqual(response.body.error, 'username and password are required')
            })
    })
    test('a user with a password that is less than 3 characters is not created', async () => {
        const newUser = {
            username: 'testuser',
            name: 'Test User',
            password: '12'
        }
        await api.post('/api/users').send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)
            .expect(response => {
                assert.strictEqual(response.body.error, 'username and password must be at least 3 characters long')
            })
    })

})

after(async () => {
    await mongoose.connection.close()
})