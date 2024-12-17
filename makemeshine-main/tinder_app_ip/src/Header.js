import React, { useState, useEffect } from "react";
import "./Header.css";
import PersonIcon from "@mui/icons-material/Person";
import ForumIcon from "@mui/icons-material/Forum";
import HomeIcon from "@mui/icons-material/Home";
import NotificationsIcon from "@mui/icons-material/Notifications";
import MapIcon from "@mui/icons-material/Map"; // Import the Map icon
import { IconButton, Popover, List, ListItem, ListItemText, Badge } from "@mui/material";
import { Link } from "react-router-dom";
import { useAuth } from "./auth";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import DarkModeIcon from "@mui/icons-material/DarkMode";

function Header() {
  const { currentUser } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (currentUser) {
      const unsubscribe = firebase
        .firestore()
        .collection("people")
        .doc(currentUser.uid)
        .onSnapshot((doc) => {
          if (doc.exists) {
            const userData = doc.data();
            setNotifications(userData.notifications || []);
          } else {
            setNotifications([]);
          }
        });

      return () => unsubscribe();
    }
  }, [currentUser]);

  const handleNotificationsClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseNotifications = () => {
    setAnchorEl(null);
    if (currentUser) {
      firebase
        .firestore()
        .collection("people")
        .doc(currentUser.uid)
        .update({ notifications: [] })
        .then(() => setNotifications([]))
        .catch((error) => console.error("Error clearing notifications: ", error));
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.style.backgroundColor = darkMode ? "white" : "#A9A9A9";
    document.body.style.color = darkMode ? "#414141" : "#000000";

    const elementsToModify = document.querySelectorAll(".dark");
    elementsToModify.forEach((element) => {
      element.style.backgroundColor = !darkMode ? "#A9A9A9" : "#FFFFFF";
    });

    const headerToModify = document.querySelectorAll(".dark-header");
    headerToModify.forEach((element) => {
      element.style.background = !darkMode
        ? "linear-gradient(to right, #000000, #676767)"
        : "linear-gradient(to right, #e0b3ff, #8d31de)";
    });

    const settingsButtons = document.querySelectorAll(".settings-button");
    settingsButtons.forEach((element) => {
      element.style.background = !darkMode ? "#444141" : "#6a0dad";
    });

    const userProfileText = document.querySelectorAll(".dark-user-profile");
    userProfileText.forEach((element) => {
      element.style.color = !darkMode ? "#444141" : "#6a0dad";
    });

    const headerIcons = document.querySelectorAll(".dark-icon");
    headerIcons.forEach((element) => {
      element.style.color = !darkMode ? "#808080" : "#6a0dad";
    });

    const swipeButtons = document.querySelectorAll(".swipeButtons-dark");
    swipeButtons.forEach((button) => {
      button.style.backgroundColor = !darkMode ? "#222" : "#fff";
      button.style.boxShadow = !darkMode
        ? "0px 10px 53px 0px #fcfcfc"
        : "0px 10px 53px 0px #6a0dad";
    });
  };

  return (
    <div className="header dark-header">
      <IconButton onClick={toggleDarkMode}>
        <DarkModeIcon fontSize="large" className="header__icon dark-icon" />
      </IconButton>

      <Link to="/profile">
        <IconButton>
          <PersonIcon fontSize="large" className="header__icon dark-icon" />
        </IconButton>
      </Link>

      <Link to="/">
        <IconButton>
          <HomeIcon fontSize="large" className="header__icon dark-icon" />
        </IconButton>
      </Link>

      <Link to="/chat">
        <IconButton>
          <ForumIcon fontSize="large" className="header__icon dark-icon" />
        </IconButton>
      </Link>

      <Link to="/map">
        <IconButton>
          <MapIcon fontSize="large" className="header__icon dark-icon" />
        </IconButton>
      </Link>

      <IconButton onClick={handleNotificationsClick}>
        <Badge badgeContent={notifications.length} color="secondary">
          <NotificationsIcon fontSize="large" className="header__icon dark-icon" />
        </Badge>
      </IconButton>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleCloseNotifications}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <List style={{ zIndex: 1000, position: "relative" }}>
          {notifications.map((notification, index) => (
            <ListItem button key={index}>
              <ListItemText primary={notification} />
            </ListItem>
          ))}
        </List>
      </Popover>
    </div>
  );
}

export default Header;
