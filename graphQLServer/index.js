const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const { GraphQLError } = require('graphql');
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
mongoose.set('strictQuery', false)
const Book = require('./models/Book')
const Author = require('./models/Author')
const User = require('./models/User')


require('dotenv').config()


const typeDefs = `

    type User {
        username: String!
        favoriteGenre: String!
        id: ID!
    }

    type Token {
        value: String!
    }

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
        me: User
    }

    type Mutation {
        addBook(
            title: String!,
            published: Int!,
            author: String!,
            genres: [String!]!
        ): Book

        editAuthor(name: String!, setBornTo: Int!): Author

        createUser(
            username: String!
            favoriteGenre: String!
        ): User
  
        login(
            username: String!
            password: String!
        ): Token
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
        me: (_root, _args, context) => {
            return context.currentUser
        }
    },
    Mutation: {
        addBook: async (_, { author: name, ...args }, context) => {
            const currentUser = context.currentUser
            if (!currentUser) {
                throw new GraphQLError('not authenticated', {
                    extensions: {
                        code: 'BAD_USER_INPUT',
                    }
                })
            }

            let author;
            if (await Author.exists({ name })) {
                author = await Author.findOne({ name })
            } else {
                try {
                    author = await Author.create({ name })
                } catch (error) {
                    throw new GraphQLError('Creating author failed', {
                        extensions: {
                            code: 'BAD_USER_INPUT',
                            invalidArgs: name,
                            error
                        }
                    })
                }
            }
            try {
                const book = await Book.create({ ...args, author: author._id })
                return book
            } catch (error) {
                throw new GraphQLError('Saving book failed', {
                    extensions: {
                        code: 'BAD_USER_INPUT',
                        invalidArgs: args.title,
                        error
                    }
                })
            }
        },
        editAuthor: async (_, { name, setBornTo }, context) => {
            const currentUser = context.currentUser
            if (!currentUser) {
                throw new GraphQLError('not authenticated', {
                    extensions: {
                        code: 'BAD_USER_INPUT',
                    }
                })
            }

            const author = await Author.findOne({ name })
            if (!author) {
                return null
            }
            author.born = setBornTo;
            await author.save();
            return author
        },
        createUser: async (_, { username, favoriteGenre }) => {
            const user = new User({ username, favoriteGenre })

            return user.save()
                .catch(error => {
                    throw new GraphQLError('Creating the user failed', {
                        extensions: {
                            code: 'BAD_USER_INPUT',
                            invalidArgs: username,
                            error
                        }
                    })
                })
        },
        login: async (_, args) => {
            const user = await User.findOne({ username: args.username })

            if (!user || args.password !== 'secret') {
                throw new GraphQLError('wrong credentials', {
                    extensions: {
                        code: 'BAD_USER_INPUT'
                    }
                })
            }

            const userForToken = {
                username: user.username,
                id: user._id,
            }
            return { value: jwt.sign(userForToken, process.env.JWT_SECRET) }
        },
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
    context: async ({ req, _res }) => {
        const auth = req ? req.headers.authorization : null
        if (auth && auth.startsWith('Bearer ')) {
            const decodedToken = jwt.verify(
                auth.substring(7), process.env.JWT_SECRET
            )
            const currentUser = await User
                .findById(decodedToken.id)
            return { currentUser }
        }
    },
}).then(({ url }) => {
    console.log(`Server ready at ${url}`)
})