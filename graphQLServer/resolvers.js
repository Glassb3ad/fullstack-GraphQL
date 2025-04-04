const Book = require('./models/Book')
const Author = require('./models/Author')
const User = require('./models/User')
const jwt = require('jsonwebtoken')
const { GraphQLError } = require('graphql');
const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub()

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
                pubsub.publish('BOOK_ADDED', { bookAdded: book })
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
    },
    Subscription: {
        bookAdded: {
            subscribe: () => pubsub.asyncIterableIterator('BOOK_ADDED')
        },
    },
}

module.exports = resolvers