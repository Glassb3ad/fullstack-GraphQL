import { gql } from '@apollo/client';

export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password)  {
      value
    }
  }
`
export const ME = gql`query {
  me {
    username
    favoriteGenre
  }
}`

export const ALL_BOOKS = gql`
  query allBooks (
    $genre: String
  ) {
    allBooks (genre: $genre) {
      title
      author {
        name
      }
      published
    }
  }
`;

export const ALL_GENRES = gql`
  query allGenres{
    allBooks  {
      genres
    }
  }
`;

export const ALL_AUTHORS = gql`
  query allAuthors {
    allAuthors {
      name
      born
      bookCount
    }
  }
`;

export const ADD_BOOK = gql`
  mutation addBook(
    $title: String!
    $published: Int!
    $author: String!
    $genres: [String!]!
  ) {
    addBook(
      title: $title
      published: $published
      author: $author
      genres: $genres
    ) {
      title
      published
      genres
    }
  }
`;

export const EDIT_AUTHOR_BIRTH_YEAR = gql`
  mutation editAutorBirthYear(
    $name: String!
    $setBornTo: Int!
  ) {
    editAuthor(
      name: $name
      setBornTo: $setBornTo
    ) {
      name
      born
    }
  }
`

export const BOOK_ADDED = gql`
  subscription {
    bookAdded {
      title
      published
      author {
        name
      }
    }
  }`