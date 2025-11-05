const User = require('../models/user')

const initialUsers = [
    {
        username: 'testuser',
        name: 'Test User',
        password: 'testpassword'

    },
    {
        username: 'testuser2',
        name: 'Test User 2',
        password: 'testpassword2'
    }
]

const usersInDb = async () => {
    const users = await User.find({})
    return users.map(user => user.toJSON())
}

module.exports = {
    initialUsers,
    usersInDb,
}