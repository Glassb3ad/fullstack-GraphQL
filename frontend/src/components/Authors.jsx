import { useQuery } from '@apollo/client';
import { ALL_AUTHORS } from '../queries';

const Authors = () => {
  const result = useQuery(ALL_AUTHORS);

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {result.loading ? (
            <div>loading...</div>
          ) : (
            result.data.allAuthors.map(({ name, born, bookCount }) => (
              <tr key={name}>
                <td>{name}</td>
                <td>{born}</td>
                <td>{bookCount}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Authors;
