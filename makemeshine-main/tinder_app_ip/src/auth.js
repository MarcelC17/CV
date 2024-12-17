import firebase from 'firebase/compat/app'; // Import firebase namespace
import { auth } from "./firebase";
import "firebase/compat/firestore";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updatePassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";

import { useState, useEffect } from 'react';

export const doCreateUserWithEmailAndPassword = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Add user data to Firestore with the user ID as the document ID
    await firebase.firestore().collection('people').doc(user.uid).set({
      email: user.email,
      picture: 'https://firebasestorage.googleapis.com/v0/b/soulsync-a49b2.appspot.com/o/default.jpg?alt=media&token=bdaedd0d-8552-4841-884e-251a13f4776d',
      // Add other user data as needed
      userId: user.uid // Set userId to the same value as the user ID
    });

    console.log('User successfully created with email/password:', user);
    console.log('User added to Firestore with ID:', user.uid);

    // Send verification email to the user's email address
    await sendEmailVerification(user, {
      url: `${window.location.origin}/`, // URL to which the user will be redirected for email verification
    });

    console.log('Verification email sent to:', user.email);

    // Sign out the user after registration
    await auth.signOut();

    return { ...user, id: user.uid }; // Return the user object with the added ID
  } catch (error) {
    console.error('Error creating user with email/password:', error);
    throw error; // Rethrow the error to propagate it up to the caller
  }
};

export const doSignInWithEmailAndPassword = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Check if the email is verified
  if (!user.emailVerified) {
    await auth.signOut();
    throw new Error('Please verify your email address before logging in.');
  }

  return user;
};

export const doSignInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Add user data to Firestore using add method
    const newUserRef = await firebase.firestore().collection('people').add({
      email: user.email,
      // Add other user data as needed
    });

    // Retrieve the user ID from the newly created document reference
    const userId = newUserRef.id;

    console.log('User successfully signed in with Google:', user);
    console.log('User added to Firestore with ID:', userId);

    return { ...user, id: userId }; // Return the user object with the added ID
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error; // Rethrow the error to propagate it up to the caller
  }
};

export const doSignOut = () => {
  return auth.signOut();
};

export const doPasswordReset = (email) => {
  return sendPasswordResetEmail(auth, email);
};

export const doPasswordChange = (password) => {
  return updatePassword(auth.currentUser, password);
};

export const getUserEmail = () => {
    return auth.currentUser ? auth.currentUser.email : null;
  };

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const unsubscribe = auth.onAuthStateChanged(user => {
          setCurrentUser(user);
          setLoading(false);
      });

      return unsubscribe;
  }, []);

  return { currentUser, loading };
};

