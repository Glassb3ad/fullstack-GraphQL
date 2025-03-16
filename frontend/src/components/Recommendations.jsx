import { useQuery } from '@apollo/client';
import { ALL_BOOKS, ME } from '../queries';

const Recommendations = () => {
  const me = useQuery(ME);
  const books = useQuery(ALL_BOOKS, {
    skip: !me?.data?.me?.favoriteGenre,
    variables: { genre: me?.data?.me?.favoriteGenre },
  });

  return (
    <div>
      <h2>Recommendations</h2>
      {me?.data?.me?.favoriteGenre ? (
        <p>
          Books in your favorite genre <b>{me?.data?.me?.favoriteGenre}</b>
        </p>
      ) : (
        <p>No favorite genre</p>
      )}
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
    </div>
  );
};

export default Recommendations;
