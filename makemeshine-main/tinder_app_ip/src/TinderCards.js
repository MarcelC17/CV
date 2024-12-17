import React, { useState, useEffect } from 'react';
import './TinderCards.css';
import TinderCard from 'react-tinder-card';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { useAuth } from './auth'; // Import the useAuth hook from your auth.js file
import SwipeButtons from './SwipeButtons'; // Import SwipeButtons

function TinderCards() {
    const [people, setPeople] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDetails, setShowDetails] = useState(false); // State to control showing user details
    const [showMatch, setShowMatch] = useState(false); // State to control showing match confirmation
    const { currentUser } = useAuth(); // Get the currently authenticated user from the auth context
    const [swipeHistory, setSwipeHistory] = useState([]); // Manage swipe history

    // COMPATIBILITY FUNCTION
    const calculateCompatibilityScore = (user1, user2) => {
        let score = 0;

        const zodiacCompatibility = {
            Aries: { Aries: 60, Taurus: 65, Gemini: 65, Cancer: 65, Leo: 90, Virgo: 45, Libra: 70, Scorpio: 80, Sagittarius: 10, Capricorn: 50, Aquarius: 55, Pisces: 65 },
            Taurus: { Aries: 60, Taurus: 70, Gemini: 70, Cancer: 80, Leo: 70, Virgo: 90, Libra: 75, Scorpio: 85, Sagittarius: 50, Capricorn: 95, Aquarius: 80, Pisces: 85 },
            Gemini: { Aries: 70, Taurus: 70, Gemini: 75, Cancer: 60, Leo: 80, Virgo: 75, Libra: 90, Scorpio: 60, Sagittarius: 75, Capricorn: 50, Aquarius: 90, Pisces: 50 },
            Cancer: { Aries: 65, Taurus: 80, Gemini: 60, Cancer: 75, Leo: 70, Virgo: 75, Libra: 60, Scorpio: 95, Sagittarius: 55, Capricorn: 45, Aquarius: 70, Pisces: 90 },
            Leo: { Aries: 90, Taurus: 70, Gemini: 80, Cancer: 70, Leo: 85, Virgo: 75, Libra: 65, Scorpio: 75, Sagittarius: 95, Capricorn: 45, Aquarius: 70, Pisces: 75 },
            Virgo: { Aries: 45, Taurus: 90, Gemini: 75, Cancer: 75, Leo: 75, Virgo: 70, Libra: 80, Scorpio: 85, Sagittarius: 70, Capricorn: 95, Aquarius: 50, Pisces: 70 },
            Libra: { Aries: 70, Taurus: 75, Gemini: 90, Cancer: 60, Leo: 65, Virgo: 80, Libra: 80, Scorpio: 85, Sagittarius: 80, Capricorn: 85, Aquarius: 95, Pisces: 50 },
            Scorpio: { Aries: 80, Taurus: 85, Gemini: 60, Cancer: 95, Leo: 75, Virgo: 85, Libra: 85, Scorpio: 90, Sagittarius: 80, Capricorn: 65, Aquarius: 60, Pisces: 95 },
            Sagittarius: { Aries: 90, Taurus: 50, Gemini: 75, Cancer: 55, Leo: 95, Virgo: 70, Libra: 80, Scorpio: 85, Sagittarius: 85, Capricorn: 55, Aquarius: 60, Pisces: 75 },
            Capricorn: { Aries: 50, Taurus: 95, Gemini: 50, Cancer: 45, Leo: 45, Virgo: 95, Libra: 85, Scorpio: 65, Sagittarius: 55, Capricorn: 85, Aquarius: 70, Pisces: 85 },
            Aquarius: { Aries: 55, Taurus: 80, Gemini: 90, Cancer: 70, Leo: 70, Virgo: 50, Libra: 95, Scorpio: 60, Sagittarius: 60, Capricorn: 70, Aquarius: 80, Pisces: 55 },
            Pisces: { Aries: 65, Taurus: 85, Gemini: 50, Cancer: 90, Leo: 75, Virgo: 70, Libra: 50, Scorpio: 95, Sagittarius: 75, Capricorn: 85, Aquarius: 55, Pisces: 80 }
            };
        
        // If there is no gender compatibility score is negative
        // if (! (user1.gender === user2.preference && user2.gender === user1.preference)) {
        //     return -1;
        // }
        
        if (! ((user1.gender === user2.preference || user2.preference === 'any') && (user2.gender === user1.preference || user1.preference === 'any'))) {
            return -1;
        }

        // If the users are not looking for the same thing score is negative
        // if (user1.lookingFor !== user2.lookingFor) {
        //     return -1;
        // }
        // Negative score means no display
        // To undo comment the above two ifs
        
        score += zodiacCompatibility[user1.starSign][user2.starSign];
        
        // Add more criteria as needed
        
        return score;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const currentUserRef = firebase.firestore().collection('people').doc(currentUser.uid);
                const currentUserDoc = await currentUserRef.get();
                const currentUserData = currentUserDoc.data();
        
                // Fetch people data excluding those who the current user swiped right on
                const querySnapshot = await firebase.firestore().collection('people').where(firebase.firestore.FieldPath.documentId(), '!=', currentUser.uid).get();
                const fetchedPeople = querySnapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(person => !currentUserData.swipes || !currentUserData.swipes.includes(person.id))
                    .map(person => ({
                        ...person,
                        compatibilityScore: calculateCompatibilityScore(currentUserData, person) // Calculate compatibility score
                    }))
                    .filter(person => person.compatibilityScore >= 0);

                // Sort people by compatibility score in descending order
                fetchedPeople.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
        
                setPeople(fetchedPeople);
                setLoading(false);
                setError(null); // Clear any previous error
            } catch (error) {
                console.error("Error fetching data: ", error);
                setError("Failed to fetch data. Please try again later.");
                setLoading(false);
            }
        };
        
        if (currentUser) {
            fetchData();
        }

    }, [currentUser]); // Fetch data whenever the currentUser changes

    const onSwipe = async (direction, personId) => {
        try {
            if (direction === 'right') {
                // Update swipes for the current user
                const currentUserRef = firebase.firestore().collection('people').doc(currentUser.uid);
                const currentUserDoc = await currentUserRef.get();
                const currentUserData = currentUserDoc.data();
                let updatedSwipes = [];
                if (currentUserData && currentUserData.swipes) {
                    updatedSwipes = [...currentUserData.swipes, personId];
                } else {
                    updatedSwipes = [personId];
                }
                await currentUserRef.set({ swipes: updatedSwipes }, { merge: true });

                // Check if the swiped person has also swiped right on the current user
                const swipedPersonRef = firebase.firestore().collection('people').doc(personId);
                const swipedPersonDoc = await swipedPersonRef.get();
                const swipedPersonData = swipedPersonDoc.data();
                if (swipedPersonData && swipedPersonData.swipes && swipedPersonData.swipes.includes(currentUser.uid)) {
                    setShowMatch(true);
                    
                    // Save notification to Firestore
                    const notificationMessage = `You matched with ${swipedPersonData.name}!`;
                    await currentUserRef.update({ notifications: firebase.firestore.FieldValue.arrayUnion(notificationMessage) });

                    // give notification to the other person too
                    const otherNotification = `You matched with ${currentUserData.name}!`;
                    const otherPersonRef = firebase.firestore().collection('people').doc(personId);
                    await otherPersonRef.update({ notifications: firebase.firestore.FieldValue.arrayUnion(otherNotification) });


                    setTimeout(() => {
                        setShowMatch(false);
                    }, 3000); // Hide match confirmation after 3 seconds
                }
            }
            
            setSwipeHistory([...swipeHistory, { direction, personId }]);
            setCurrentIndex(currentIndex + 1);
            setShowDetails(false);
        } catch (error) {
            console.error('Error updating swipes:', error);
        }
    };

    const handleUndo = async () => {
        const lastSwipe = swipeHistory.pop();
        if (lastSwipe) {
            const { direction, personId } = lastSwipe;
            const currentUserRef = firebase.firestore().collection('people').doc(currentUser.uid);

            if (direction === 'right') {
                const currentUserDoc = await currentUserRef.get();
                const currentUserData = currentUserDoc.data();
                const updatedSwipes = currentUserData.swipes.filter(id => id !== personId);
                await currentUserRef.set({ swipes: updatedSwipes }, { merge: true });
            }

            setCurrentIndex(currentIndex - 1);
            setSwipeHistory([...swipeHistory]);
        }
    };

    const handleSwipeLeft = () => {
        if (people[currentIndex]) {
            onSwipe('left', people[currentIndex].id);
        }
    };

    const handleSwipeRight = () => {
        if (people[currentIndex]) {
            onSwipe('right', people[currentIndex].id);
        }
    };

    const toggleDetails = () => {
        setShowDetails(prevShowDetails => !prevShowDetails);
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
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center', 
            width: '100%', 
            height: '100%', 
            overflow: 'hidden' 
          }}>
            {showMatch && (
                <div className="matchConfirmation" style={{
                    position: 'fixed',
                    top: '20vh',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#fff',
                    padding: '20px',
                    borderRadius: '10px',
                    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
                    zIndex: '1000',
                    textAlign: 'center'
                }}>
                    <p>You have matched!</p>
                </div>
            )}
            {people.slice(currentIndex, currentIndex + 1).map((person, index) => (
                <div key={index} style={{ position: 'relative', width: '100%', left: 0, top: '20px', zIndex: 1000009 }}>
                    <TinderCard
                        className='swipe'
                        key={person.name}
                        onSwipe={(dir) => onSwipe(dir, person.id)}
                        preventSwipe={['up', 'down']}
                    >
                        <div className='cardContainer' style={{ position: 'relative', width: '100%', height: '400px', borderRadius: '20px', overflow: 'hidden', marginBottom: '20px' }}>
                            <div style={{ backgroundImage: `url(${person.picture})`, backgroundSize: 'cover', backgroundPosition: 'center', width: '100vw', maxWidth: '350px', height: '400px', borderRadius: '20px', position: 'relative', overflow: 'hidden' }} className='card'>
                                <h3 style={{ position: 'absolute', bottom: '10px', left: '10px', color: 'white' }}>{person.name}, {person.age}</h3>
                                <div
                                    className={`details ${showDetails ? 'show sliding' : 'hide'}`}
                                    style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: `${showDetails ? '47%' : '150%'}`, // Adjusted left property for sliding effect
                                        transform: 'translate(-50%, -50%)',
                                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                        borderRadius: '10px',
                                        width: '100vw',
                                        maxWidth: '350px',
                                        height: '400px',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'left',
                                        flexDirection: 'column',
                                        padding: '20px',
                                        fontSize: '1.0em',
                                        marginLeft: '20px',
                                        color: '#191a1b96'
                                    }}>
                                    <p><strong>Description: </strong>{person.description}</p>
                                    <p><strong>Location:</strong> {person.location}</p>
                                    <p><strong>Gender:</strong> {person.gender}</p>
                                    <p><strong>Height:</strong> {person.height}</p>
                                    <p><strong>Star Sign:</strong> {person.starSign}</p>
                                    <p><strong>Looking for:</strong> {person.lookingFor}</p>
                                    <br></br>
                                    <p style={{ fontFamily: 'Comic Sans MS' }}>
                                        <strong>Based on your sign, your compatibility with </strong> 
                                        <span style={{ color: '#191a1b96', fontWeight: 'bold' }}>{person.starSign}</span> 
                                        <strong> is </strong> 
                                        <span style={{ color: '#191a1b96', fontWeight: 'bold' }}>{person.compatibilityScore}%</span>
                                    </p>
                                </div>
                            </div>
                            {showDetails ? (
                                <button className="undoButton" onClick={undoDetails}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                        <circle cx="12" cy="12" r="10" fill="white" />
                                        <path d="M12 15l-6-6h12z" fill="black" />
                                    </svg>
                                </button>
                            ) : (
                                <button className="showDetailsButton" onClick={toggleDetails}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                        <circle cx="12" cy="12" r="10" fill="white" />
                                        <path d="M12 9l-6 6h12z" fill="black" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </TinderCard>
                </div>
            ))}

            <div style = {{
                display: 'flex',
                position: 'fixed',
                justifyContent: 'center',
                bottom: 100,
                alignItems: 'center',
                width: '100%',
            }}>
            <SwipeButtons 
                onUndo={handleUndo} 
                onSwipeLeft={handleSwipeLeft} 
                onSwipeRight={handleSwipeRight} 
            /></div>
        </div>
      );

}

export default TinderCards;
