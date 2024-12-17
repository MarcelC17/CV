import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import { auth } from "./firebase";
import { IconButton } from '@mui/material';
import ExitToAppIcon from '@mui/icons-material/Logout';
import Card from './Card'; // Import the Card component
import './UserProfile.css'; // Import CSS file for styling

function UserProfile({ backButton }) {
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true); // Add loading state
  const [userData, setUserData] = useState(null); // State to store user data
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserEmail(user.email);
      } else {
        setUserEmail('');
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut(); // Sign out the current user
      navigate('/'); // Redirect to the login page after logout
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const fetchUserProfile = async () => {
    try {
      if (!auth.currentUser) {
        console.error("User is not logged in.");
        setLoading(false); // Stop loading if user is not logged in
        return;
      }

      const userDocument = await firebase
        .firestore()
        .collection("people")
        .where("email", "==", auth.currentUser.email)
        .get();

      if (!userDocument.empty) {
        const userData = userDocument.docs[0].data();
        setUserData(userData); // Store user data
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setLoading(false); // Set loading to false after fetching data
    }
  };

  return (
    <div>
      <div className="user-profile dark">
        <div>
          <h1 className="dark-user-profile">User Profile</h1>
          {/* Display loading indicator or fetched profile */}
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div>
              <Card userData={userData} /> {/* Pass user data to Card component */}
            </div>
          )}
        </div>
        <Link to="/profile_settings">
          <button className="settings-button">Edit Profile</button>
        </Link>
        <IconButton onClick={handleLogout}>
          <ExitToAppIcon fontSize='large' className='header__icon' />
        </IconButton>
      </div>
    </div>
  );
}

export default UserProfile;
