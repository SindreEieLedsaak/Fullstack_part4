const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')


const initialBlogs = [
    {
        title: 'React patterns',
        author: 'Michael Chan',
        url: 'https://reactpatterns.com/',
        likes: 7

    },
    {
        title: 'Go To Statement Considered Harmful',
        author: 'Edsger W. Dijkstra',
        url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
        likes: 5
    },
]


const blogsInDb = async () => {
    const blogs = await Blog.find({})
    return blogs.map(blog => blog.toJSON())
}

const getToken = async () => {
    const user = await User.findOne({})
    const userForToken = {
        username: user.username,
        id: user._id,
    }
    return `Bearer ${jwt.sign(userForToken, process.env.SECRET)}`
}


module.exports = {
    initialBlogs,
    blogsInDb,
    getToken
}

