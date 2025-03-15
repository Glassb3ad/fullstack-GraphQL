import { useQuery, useMutation } from '@apollo/client';
import { ALL_AUTHORS, EDIT_AUTHOR_BIRTH_YEAR } from '../queries';

const Authors = () => {
  const result = useQuery(ALL_AUTHORS);
  const [mutateAuthor] = useMutation(EDIT_AUTHOR_BIRTH_YEAR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
  });

  const onSubmit = (event) => {
    event.preventDefault();
    const author = event.target.author.value;
    const birthYear = event.target.birthYear.value;
    mutateAuthor({
      variables: { name: author, setBornTo: parseInt(birthYear) },
    });
  };

  return (
    <div>
      <section>
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
      </section>
      <section>
        <h2>Set birthyear</h2>
        <form onSubmit={onSubmit}>
          <div>
            <label htmlFor="author">Author</label>
            <input type="text" id="author" name="author" />
          </div>
          <div>
            <label htmlFor="birthYear">Birth year</label>
            <input type="number" id="birthYear" name="birthYear" />
          </div>
          <button type="submit">update author</button>
        </form>
      </section>
    </div>
  );
};

export default Authors;
