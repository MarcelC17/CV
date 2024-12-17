import React from 'react';
import { useAuth } from '../../contexts/authContext';

const Home = () => {
    const { currentUser } = useAuth();

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-3xl font-bold mb-4">Welcome to SoulSync</h1>
            {currentUser ? (
                <div className="text-xl">
                    Hello, {currentUser.displayName ? currentUser.displayName : currentUser.email}, you are now logged in.
                </div>
            ) : (
                <div className="text-xl">Please sign in to explore SoulSync.</div>
            )}
        </div>
    );
};

export default Home;