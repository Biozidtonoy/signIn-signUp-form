// Import the functions you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword   // ← added this
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

function showMessage(message, divId) {
  const messageDiv = document.getElementById(divId);
  if (!messageDiv) return;
  messageDiv.innerText    = message;
  messageDiv.style.display = "block";
  messageDiv.style.opacity = "1";
  setTimeout(() => {
    messageDiv.style.opacity = "0";
    setTimeout(() => (messageDiv.style.display = "none"), 300);
  }, 3000);
}

// ——— SIGN UP (on signUp.html) ———
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fname    = document.getElementById("firstName").value.trim();
    const lname    = document.getElementById("lastName").value.trim();
    const email    = document.getElementById("rEmail").value.trim();
    const password = document.getElementById("rPassword").value;
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      const userData = { firstName: fname, lastName: lname, email };
      await setDoc(doc(db, "users", user.uid), userData);
      showMessage("Account created successfully!", "showUpMessage");
      setTimeout(() => (window.location.href = "index.html"), 1500);
    } catch (error) {
      console.error("Signup error:", error.code, error.message);
      if (error.code === "auth/email-already-in-use") {
        showMessage("That email is already in use.", "signUpMessage");
      } else if (error.code === "auth/invalid-email") {
        showMessage("Invalid email address.", "signUpMessage");
      } else if (error.code === "auth/weak-password") {
        showMessage("Password should be at least 6 characters.", "signUpMessage");
      } else {
        showMessage("Error: " + error.message, "signUpMessage");
      }
    }
  });
}

// ——— SIGN IN (on index.html) ———
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email    = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      console.log("Sign‑in successful:", user.email);
      window.location.href = "dashboard.html";  // ← redirect on success
    } catch (error) {
      console.error("Sign‑in error:", error.code, error.message);
      let msg = "Unable to log in.";
      if (error.code === "auth/user-not-found") {
        msg = "No account found with this email.";
      } else if (error.code === "auth/wrong-password") {
        msg = "Incorrect password.";
      } else if (error.code === "auth/invalid-email") {
        msg = "Invalid email address.";
      }
      showMessage(msg, "signInMessage");  // ← use the correct div ID
    }
  });
}
