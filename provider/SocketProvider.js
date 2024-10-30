// SocketProvider.js
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import io from "socket.io-client";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(false);
  const socket = useRef(null);

  useEffect(() => {
    // Kết nối socket khi component khởi tạo
    socket.current = io("http://192.168.88.142:3000", {
      transports: ["websocket"],
    });

    socket.current.on("connect", () => setIsOnline(true));
    socket.current.on("disconnect", () => setIsOnline(false));

    return () => {
      // Ngắt kết nối khi component unmount
      socket.current.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socket.current, isOnline }}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook để sử dụng socket dễ dàng hơn
export const useSocket = () => useContext(SocketContext);
