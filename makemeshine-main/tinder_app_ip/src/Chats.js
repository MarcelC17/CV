import React, { useState, useEffect } from 'react';
import './Chats.css';
import Chat from './Chat';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { useAuth } from './auth'; // Import the useAuth hook from your auth.js file

function Chats() {
  const { currentUser } = useAuth(); // Get the current user from the auth context
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      setError('User not logged in');
      return;
    }

    const fetchMatches = async () => {
      try {
        const currentUserRef = firebase.firestore().collection('people').doc(currentUser.uid);
        const currentUserDoc = await currentUserRef.get();
        const currentUserData = currentUserDoc.data();

        if (!currentUserData || !currentUserData.swipes) {
          setMatches([]);
          setLoading(false);
          return;
        }

        // Find matches where both users have each other in their swipes field
        const querySnapshot = await firebase.firestore().collection('people')
          .where('swipes', 'array-contains', currentUser.uid) // Current user swiped right
          .get();

        const matchedPeople = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(person => currentUserData.swipes.includes(person.id)); // Matched both ways

        setMatches(matchedPeople);
        setLoading(false);
        setError(null);
      } catch (error) {
        console.error('Error fetching matches:', error);
        setError('Failed to fetch matches. Please try again later.');
        setLoading(false);
      }
    };

    fetchMatches();

    // Cleanup function to prevent memory leaks
    return () => {
      setMatches([]);
      setLoading(true);
      setError(null);
    };
  }, [currentUser]);

  return (
    <div className='chats'>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>Error: {error}</div>
      ) : matches.length === 0 ? (
        <div>No matches found</div>
      ) : (
        matches.map(match => (
          <Chat
            key={match.id}
            id={match.id}
            name={match.name}
            profilePic={match.picture}
            message="You matched!"
            timestamp="" // Set timestamp as needed
          />
        ))
      )}
    </div>
  );
}

export default Chats;
