
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

import authFetch from "../utils/authFetch";

const API_URL = "http://localhost:5000/api/v1/auth";
const PROFILE_URL = "http://localhost:5000/api/v1/users/profile";

// User type
export interface User {
  id: string;
  name: string;
  email: string;
  role: "passenger" | "admin";
}

// AuthContext type
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password?: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  getProfile: () => Promise<any>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore the saved user when the application starts
  useEffect(() => {
    const storedUser = localStorage.getItem("railconnect_user");
    const storedToken = localStorage.getItem("railsetu_token");

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser) as User);
      } catch {
        localStorage.removeItem("railconnect_user");
        localStorage.removeItem("railsetu_token");
      }
    } else {
      // A user without a token is not considered logged in
      localStorage.removeItem("railconnect_user");
      localStorage.removeItem("railsetu_token");
    }

    setLoading(false);
  }, []);

  // LOGIN
  const login = async (email: string, password?: string) => {
    let response: Response;

    try {
      response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });
    } catch {
      throw new Error(
        "Cannot connect to the server. Check that the backend is running."
      );
    }

    let result: any;

    try {
      result = await response.json();
    } catch {
      throw new Error(
        `The server returned an unreadable response (HTTP ${response.status}).`
      );
    }

    if (!response.ok) {
      throw new Error(result.message || "Login failed.");
    }

    if (!result.token || !result.data) {
      throw new Error(
        "Login failed: The server returned an invalid response."
      );
    }

    const loggedInUser: User = {
      id: String(result.data.id),
      name: result.data.name,
      email: result.data.email,
      role: result.data.role || "passenger",
    };

    // Store the JWT and user information
    localStorage.setItem("railsetu_token", result.token);
    localStorage.setItem(
      "railconnect_user",
      JSON.stringify(loggedInUser)
    );

    setUser(loggedInUser);
  };

  // REGISTER
  const register = async (data: any) => {
    let response: Response;

    try {
      response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          password: data.password,
        }),
      });
    } catch {
      throw new Error(
        "Cannot connect to the server. Check that the backend is running."
      );
    }

    let result: any;

    try {
      result = await response.json();
    } catch {
      throw new Error(
        `The server returned an unreadable response (HTTP ${response.status}).`
      );
    }

    if (!response.ok) {
      throw new Error(
        result.message ||
          `Registration failed with HTTP ${response.status}.`
      );
    }

    // Registration does not log the user in.
    // The user must log in separately to receive a JWT.
  };

  // GET PROTECTED PROFILE
  const getProfile = async () => {
    let response: Response;

    try {
      response = await authFetch(PROFILE_URL);
    } catch {
      throw new Error(
        "Cannot connect to the server while retrieving your profile."
      );
    }

    let result: any;

    try {
      result = await response.json();
    } catch {
      throw new Error(
        `The server returned an unreadable response (HTTP ${response.status}).`
      );
    }

    if (!response.ok) {
      throw new Error(
        result.message || "Failed to retrieve your profile."
      );
    }

    return result;
  };

  // LOGOUT
  const logout = () => {
    setUser(null);

    localStorage.removeItem("railconnect_user");
    localStorage.removeItem("railsetu_token");
  };

  // Context value
  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    login,
    register,
    getProfile,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error(
      "useAuth must be used within an AuthProvider"
    );
  }

  return context;
};
