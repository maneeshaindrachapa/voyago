import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import axios from 'axios';

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

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await axios.get(BACKEND_URL + '/api/users');
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
        setError(err.message || 'Failed to fetch users');
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
