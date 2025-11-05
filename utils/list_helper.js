const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
    if (blogs.length === 0) {
        return null
    }

    const favorite = blogs.reduce((max, blog) => {
        return blog.likes > max.likes ? blog : max
    }, blogs[0])

    return {
        title: favorite.title,
        author: favorite.author,
        likes: favorite.likes
    }
}

const mostBlogs = (blogs) => {
    if (blogs.length === 0) {
        return null
    }

    const blogCounts = {}

    blogs.forEach(blog => {
        blogCounts[blog.author] = (blogCounts[blog.author] || 0) + 1
    })

    let topAuthor = null
    let maxBlogs = 0

    for (const [author, count] of Object.entries(blogCounts)) {
        if (count > maxBlogs) {
            maxBlogs = count
            topAuthor = author
        }
    }

    return {
        author: topAuthor,
        blogs: maxBlogs
    }
}

const mostLikes = (blogs) => {
    if (blogs.length === 0) {
        return null
    }

    const likeCounts = {}

    blogs.forEach(blog => {
        likeCounts[blog.author] = (likeCounts[blog.author] || 0) + blog.likes
    })

    let topAuthor = null
    let maxLikes = 0

    for (const [author, likes] of Object.entries(likeCounts)) {
        if (likes > maxLikes) {
            maxLikes = likes
            topAuthor = author
        }
    }

    return {
        author: topAuthor,
        likes: maxLikes
    }
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}

