import React, { useState, useEffect } from 'react';
import './TinderCards.css';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { useAuth } from './auth'; // Import the useAuth hook from your auth.js file

function Card() {
    const [people, setPeople] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDetails, setShowDetails] = useState(false); // State to control showing user details
    const { currentUser } = useAuth(); // Get the currently authenticated user from the auth context

    useEffect(() => {
        const fetchData = async () => {
            try {
                const currentUserRef = firebase.firestore().collection('people').doc(currentUser.uid);
                const currentUserDoc = await currentUserRef.get();
                const currentUserData = currentUserDoc.data();
        
                // Fetch only current person
                const querySnapshot = await firebase.firestore().collection('people').where(firebase.firestore.FieldPath.documentId(), '==', currentUser.uid).get();
                const fetchedPeople = querySnapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(person => !currentUserData.swipes || !currentUserData.swipes.includes(person.id));
        
                setPeople(fetchedPeople);
                setLoading(false);
                setError(null); // Clear any previous error
            } catch (error) {
                console.error("Error fetching data: ", error);
                setError("Failed to fetch data. Please try again later.");
                setLoading(false);
            }
        };
        
        fetchData();
        

        if (currentUser) {
            fetchData();
        }

    }, [currentUser]); // Fetch data whenever the currentUser changes

    

    const toggleDetails = () => {
        setShowDetails(!showDetails);
    };

    const undoDetails = () => {
        setShowDetails(false);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className='tinderCards__cardContainer'>
            {/* Render the current and next cards */}
            {people.slice(currentIndex, currentIndex + 2).map((person, index) => (
                <div key={index} style={{ position: 'absolute', width: '100%', left: 0, zIndex: index === 0 ? 2 : 1 }}>
                    <div className='swipe'>
                        <div className='cardContainer'>
                        <div style={{ backgroundImage: `url(${person.picture})` }} className='card'>
                            <h3>{person.name}, {person.age}</h3>
                            {showDetails && (
                                <div className="details">
                                    <p><strong>Description: </strong> {person.description}</p>
                                    <p><strong>Location:</strong> {person.location}</p>
                                    <p><strong>Gender:</strong> {person.gender}</p>
                                    <p><strong>Heigh:</strong> {person.height}</p>
                                    <p><strong>Star Sign:</strong> {person.starSign}</p>
                                    <p><strong>Looking for:</strong> {person.lookingFor}</p>
                                </div>
                            )}
                            </div>
                            {showDetails ? (
                                <button className="undoButton" onClick={undoDetails}>
                                    {/* Upper arrow icon */}
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                        <circle cx="12" cy="12" r="10" fill="white" />
                                        <path d="M12 15l-6-6h12z" fill="black" />
                                    </svg>
                                </button>
                            ) : (
                                <button className="showDetailsButton" onClick={toggleDetails}>
                                    {/* Down arrow icon inside a circle */}
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                        <circle cx="12" cy="12" r="10" fill="white" />
                                        <path d="M12 9l-6 6h12z" fill="black" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default Card;
