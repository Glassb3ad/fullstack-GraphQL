import { gql, useQuery } from '@apollo/client';

const ALL_BOOKS = gql`
  query {
    allBooks {
      title
      author
      published
    }
  }
`;

const Books = () => {
  const result = useQuery(ALL_BOOKS);

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
          {result.loading ? (
            <div>Loading...</div>
          ) : (
            result.data.allBooks.map(({ title, author, published }) => (
              <tr key={title}>
                <td>{title}</td>
                <td>{author}</td>
                <td>{published}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Books;
