const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const { v4: uuid } = require('uuid')
const mongoose = require('mongoose')
mongoose.set('strictQuery', false)
const Book = require('./models/Book')
const Author = require('./models/Author')


require('dotenv').config()


const typeDefs = `
    type Book {
        title: String!,
        published: Int!,
        author: Author!,
        id: String!,
        genres: [String!]!
    }

    type Author {
        name: String!,
        id: String!,
        bookCount: Int!
        born: Int
    }

    type Query {
        bookCount: Int!
        authorCount: Int!
        allBooks(author: String, genre: String): [Book]!
        allAuthors: [Author]!
    }

    type Mutation {
        addBook(
            title: String!,
            published: Int!,
            author: String!,
            genres: [String!]!
        ): Book
        editAuthor(name: String!, setBornTo: Int!): Author
    }
`
const resolvers = {
    Query: {
        bookCount: () => Book.collection.countDocuments(),
        authorCount: () => Author.collection.countDocuments(),
        allAuthors: async () => { return await Author.find({}) },
        allBooks: async (_, { author, genre }) => {
            return await Book.aggregate([
                {
                    $lookup: {
                        from: "authors",
                        localField: "author",
                        foreignField: "_id",
                        as: "author"
                    }
                },
                { $unwind: "$author" },
                (author && { $match: { "author.name": author } }),
                (genre && { $match: { genres: { $in: [genre] } } })
            ].filter(Boolean));
        },
    },
    Mutation: {
        addBook: async (_, { author: name, ...args }) => {
            const author = await Author.exists({ name }) ? await Author.findOne({ name }) : Author.create({ name })
            const book = await Book.create({ ...args, author: author._id })
            return book
        },
        editAuthor: async (_, { name, setBornTo }) => {
            const author = await Author.findOne({ name })
            if (!author) {
                return null
            }
            author.born = setBornTo;
            await author.save();
            return author
        }
    },
    Author: {
        bookCount: async (root) => await Book.countDocuments({ author: root.id })
    }
}

const server = new ApolloServer({
    typeDefs,
    resolvers,
})

const MONGODB_URI = process.env.MONGODB_URI
console.log('connecting to', MONGODB_URI)
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('connected to MongoDB')
    })
    .catch((error) => {
        console.log('error connection to MongoDB:', error.message)
    })


startStandaloneServer(server, {
    listen: { port: 4000 },
}).then(({ url }) => {
    console.log(`Server ready at ${url}`)
})