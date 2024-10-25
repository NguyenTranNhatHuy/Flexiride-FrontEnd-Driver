// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    token: null,
    userId: null,
    isAuthenticated: false,
    user: null,
  });

  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("userToken");
      const storedUserId = await AsyncStorage.getItem("userId");
      const storedUser = await AsyncStorage.getItem("userInfo");

      if (storedToken && storedUserId && storedUser) {
        setAuthState({
          token: storedToken,
          userId: storedUserId,
          isAuthenticated: true,
          user: JSON.parse(storedUser),
        });
      }
    } catch (error) {
      console.error("Failed to load user data from storage", error);
    }
  };

  const authenticate = async ({ token, user }) => {
    try {
      await AsyncStorage.setItem("userToken", token);
      await AsyncStorage.setItem("userId", user._id);
      await AsyncStorage.setItem("userInfo", JSON.stringify(user)); // Store user data as a stringified JSON

      setAuthState({
        token,
        userId: user._id,
        isAuthenticated: true,
        user,
      });
      console.log("Authentication success:", authState);
    } catch (error) {
      console.error("Failed to store user data", error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("userToken");
      await AsyncStorage.removeItem("userId");
      await AsyncStorage.removeItem("userInfo");
      setAuthState({
        token: null,
        userId: null,
        isAuthenticated: false,
        user: null,
      });
    } catch (error) {
      console.error("Failed to clear user data", error);
    }
  };

  return (
    <AuthContext.Provider value={{ authState, authenticate, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
