import { useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { LOGIN } from '../queries';

// eslint-disable-next-line react/prop-types
const Login = ({ setToken }) => {
  const [login, result] = useMutation(LOGIN, {
    onError: (error) => {
      console.log(error);
    },
  });

  const onSubmit = async (event) => {
    event.preventDefault();
    const username = event.target.username.value;
    const password = event.target.password.value;
    login({ variables: { username, password } });
  };

  useEffect(() => {
    if (result.data) {
      const token = result.data.login.value;
      setToken(token);
      localStorage.setItem('user-token', token);
    }
  }, [result.data, setToken]);

  return (
    <div>
      <form onSubmit={onSubmit}>
        <input
          type="text"
          id="username"
          name="username"
          aria-label="Username"
          placeholder="Username"
        />
        <input
          type="password"
          id="password"
          name="password"
          aria-label="Password"
          placeholder="Password"
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
