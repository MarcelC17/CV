import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Header from "./Header";
import TinderCards from "./TinderCards";
import Chats from "./Chats";
import ChatScreen from "./ChatScreen";
import UserProfile from "./UserProfile";
import ProfileSettings from "./ProfileSettings";
import Login from "./components/auth/login";
import Register from "./components/auth/register";
import { AuthProvider } from "./contexts/authContext";
import { auth } from "./firebase";
import { useEffect, useState } from "react";
import MapComponent from "./MapComponent"; // Import the MapComponent

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user ? user : null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <AuthProvider>
        <div className="App">
          {!loading && user && user.emailVerified && <Header user={user} />}
          <Routes>
            <Route path="/chat/:person" element={<ChatScreen />} />
            <Route path="/chat" element={<Chats />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/profile_settings" element={<ProfileSettings />} />
            <Route path="/map" element={<MapComponent />} /> {/* Add MapComponent route */}
            <Route
              path="/"
              element={
                user && user.emailVerified ? (
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <TinderCards />
                  </div>
                ) : (
                  <Login />
                )
              }
            />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
