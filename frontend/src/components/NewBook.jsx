import { useState } from 'react';
import { useMutation, useSubscription } from '@apollo/client';
import { ADD_BOOK, BOOK_ADDED } from '../queries';
const NewBook = () => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [published, setPublished] = useState('');
  const [genre, setGenre] = useState('');
  const [genres, setGenres] = useState([]);

  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      window.alert(`Created book with title ${data.data.bookAdded.title}`);
    },
  });

  const [createPerson] = useMutation(ADD_BOOK, {
    onCompleted: () => {
      setTitle('');
      setPublished('');
      setAuthor('');
      setGenres([]);
      setGenre('');
    },
    refetchQueries: ['allBooks', 'allAuthors', 'allGenres'],
  });

  const submit = async (event) => {
    event.preventDefault();
    createPerson({
      variables: {
        title,
        author,
        published: Number.parseInt(published),
        genres,
      },
    });
  };

  const addGenre = () => {
    setGenres(genres.concat(genre));
    setGenre('');
  };

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author
          <input
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          published
          <input
            type="number"
            value={published}
            onChange={({ target }) => setPublished(target.value)}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type="button">
            add genre
          </button>
        </div>
        <div>genres: {genres.join(' ')}</div>
        <button type="submit">create book</button>
      </form>
    </div>
  );
};

export default NewBook;
