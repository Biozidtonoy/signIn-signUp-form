// Import the functions you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword, signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";
import {
  getFirestore,
  setDoc,
  doc
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDHrpeOhbo0LXrdRrf23tFfXkTpSRQgguQ",
  authDomain: "login-form-a0842.firebaseapp.com",
  projectId: "login-form-a0842",
  storageBucket: "login-form-a0842.firebasestorage.app",
  messagingSenderId: "535452399491",
  appId: "1:535452399491:web:8355e8b7619cc43214a8b6"
};

// Initialize Firebase
initializeApp(firebaseConfig);
const auth = getAuth();
const db   = getFirestore();

/**
 * Displays a message in the given div ID, then fades it out.
 */
function showMessage(message, divId) {
  const messageDiv = document.getElementById(divId);
  if (!messageDiv) {
    console.error(`No element found with id="${divId}"`);
    return;
  }
  messageDiv.innerText   = message;
  messageDiv.style.display = "block";
  messageDiv.style.opacity = "1";
  setTimeout(() => {
    messageDiv.style.opacity = "0";
    // hide after fade
    setTimeout(() => (messageDiv.style.display = "none"), 300);
  }, 3000);
}

document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  // Grab values
  const fname    = document.getElementById("firstName").value.trim();
  const lname    = document.getElementById("lastName").value.trim();
  const email    = document.getElementById("rEmail").value.trim();
  const password = document.getElementById("rPassword").value;

  try {
    // 1) Create user in Auth
    const { user } = await createUserWithEmailAndPassword(auth, email, password);

    // 2) Prepare user data for Firestore
    const userData = {
      firstName: fname,
      lastName:  lname,
      email:     email
    };

    // 3) Write to Firestore
    await setDoc(doc(db, "users", user.uid), userData);
    console.log("User document written to Firestore");

    // 4) Show success and redirect
    showMessage("Account created successfully!", "showUpMessage");
    setTimeout(() => (window.location.href = "index.html"), 1500);

  } catch (error) {
    // Log the full error for debugging
    console.error("Signup or Firestore error:", error.code, error.message);

    // Handle specific Auth errors
    if (error.code === "auth/email-already-in-use") {
      showMessage("That email is already in use.", "signUpMessage");
    } else if (error.code === "auth/invalid-email") {
      showMessage("Invalid email address.", "signUpMessage");
    } else if (error.code === "auth/weak-password") {
      showMessage("Password should be at least 6 characters.", "signUpMessage");
    } else if (error.code.startsWith("permission-denied")) {
      // Firestore permissions
      showMessage("Permission denied: check your Firestore rules.", "signUpMessage");
    } else {
      // Fallback for any other error (including Firestore writes)
      showMessage("Error: " + error.message, "signUpMessage");
    }
  }
});

