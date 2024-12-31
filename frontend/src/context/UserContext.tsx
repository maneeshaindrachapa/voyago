import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';

interface User {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
}

interface UserContextType {
  users: User[] | null;
  loading: boolean;
  error: string | null;
}

const UserContext = createContext<UserContextType>({
  users: null,
  loading: true,
  error: null,
});

const UserProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    const fetchUsers = async () => {
      const token = await getToken();
      setLoading(true);
      try {
        const source = axios.CancelToken.source();
        const timeout = setTimeout(() => {
          source.cancel('Request timeout');
        }, 10000);

        const response = await axios.get(BACKEND_URL + '/api/users', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cancelToken: source.token,
        });

        clearTimeout(timeout);

        const simplifiedUsers = response.data.map((user: any) => {
          return {
            id: user.id,
            email: user.email || null,
            firstName: user.firstName || null,
            lastName: user.lastName || null,
            imageUrl: user.imageUrl || null,
          };
        });

        setUsers(simplifiedUsers);
      } catch (err: any) {
        if (axios.isCancel(err)) {
          setError('Request timed out');
        } else {
          setError(err.message || 'Failed to fetch users');
        }
        console.log(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <UserContext.Provider value={{ users, loading, error }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;

export const useUserContext = () => {
  return useContext(UserContext);
};
