import { useQuery } from '@apollo/client';
import { ALL_BOOKS, ALL_GENRES } from '../queries';
import { useState } from 'react';

const Books = () => {
  const [selectedGenre, setSelectedGenre] = useState(null);
  const books = useQuery(ALL_BOOKS, { variables: { genre: selectedGenre } });
  const genres = useQuery(ALL_GENRES);
  return (
    <div>
      <h2>books</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.loading ? (
            <div>Loading...</div>
          ) : (
            books?.data?.allBooks.map(({ title, author, published }) => (
              <tr key={title}>
                <td>{title}</td>
                <td>{author.name}</td>
                <td>{published}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <h3>Choose genre</h3>
      {genres?.data?.allBooks
        .flatMap((book) => book.genres)
        .reduce(
          (accGenres, currentGenre) =>
            accGenres.includes(currentGenre)
              ? accGenres
              : accGenres.concat(currentGenre),
          []
        )
        .map((genre) => (
          <button
            key={genre}
            style={
              selectedGenre === genre
                ? { backgroundColor: 'black', color: 'white' }
                : {}
            }
            onClick={() => {
              if (selectedGenre !== genre) {
                setSelectedGenre(genre);
              } else {
                setSelectedGenre(null);
              }
            }}
          >
            {genre}
          </button>
        ))}
    </div>
  );
};

export default Books;
