import React from "react";
import "./SwipeButtons.css";
import ReplayIcon from "@mui/icons-material/Replay";
import CloseIcon from "@mui/icons-material/Close"; 
import FavoriteIcon from "@mui/icons-material/Favorite";
import { IconButton } from "@mui/material";

function SwipeButtons({ onUndo, onSwipeLeft, onSwipeRight }) {
  console.log('Rendering SwipeButtons');
  
  return (
    <div className="swipeButtons">
      <IconButton onClick={onUndo} className="swipeButtons-dark">
        <ReplayIcon fontSize="large" className="swipeButtons__repeat" />
      </IconButton>
      <IconButton onClick={onSwipeLeft} className="swipeButtons-dark">
        <CloseIcon fontSize="large" className="swipeButtons__left" />
      </IconButton>
      <IconButton onClick={onSwipeRight} className="swipeButtons-dark">
        <FavoriteIcon fontSize="large" className="swipeButtons__right" />
      </IconButton>
    </div>
  );
}

export default SwipeButtons;