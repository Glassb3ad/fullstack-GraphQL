import { useEffect, useState } from 'react';
import Authors from './components/Authors';
import Books from './components/Books';
import NewBook from './components/NewBook';
import Login from './components/Login';
import { useApolloClient } from '@apollo/client';
import Recommendations from './components/Recommendations';

const App = () => {
  const [page, setPage] = useState('authors');
  const [token, setToken] = useState(null);
  const client = useApolloClient();

  useEffect(() => {
    const localToken = localStorage.getItem('user-token');
    if (localToken) {
      setToken(localToken);
    }
  }, [setToken]);

  const removeToken = () => {
    localStorage.clear();
    setToken(null);
    client.resetStore();
  };

  return (
    <div>
      <header
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <nav>
          <button onClick={() => setPage('authors')}>Authors</button>
          <button onClick={() => setPage('books')}>Books</button>
          {token && (
            <button onClick={() => setPage('recommendations')}>
              Recommendations
            </button>
          )}
          {token && <button onClick={() => setPage('add')}>Add book</button>}
        </nav>
        {token ? (
          <button onClick={removeToken}>logout</button>
        ) : (
          <Login setToken={setToken} />
        )}
      </header>
      {page === 'authors' && <Authors />}
      {page === 'books' && <Books />}
      {page === 'recommendations' && token && <Recommendations />}
      {page === 'add' && token && <NewBook />}
    </div>
  );
};

export default App;
