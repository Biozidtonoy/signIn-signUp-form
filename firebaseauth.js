// Import the functions you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail   // imported for OTP flow
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

// Utility to show messages
function showMessage(message, divId) {
  const div = document.getElementById(divId);
  if (!div) return;
  div.innerText    = message;
  div.style.display = "block";
  div.style.opacity = "1";
  setTimeout(() => {
    div.style.opacity = "0";
    setTimeout(() => (div.style.display = "none"), 300);
  }, 3000);
}
// ——— SIGN UP (on signUp.html) ———
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  const resendBtn = document.getElementById("resendVerification");

  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Gather inputs
    const fname    = document.getElementById("firstName").value.trim();
    const lname    = document.getElementById("lastName").value.trim();
    const email    = document.getElementById("rEmail").value.trim();
    const password = document.getElementById("rPassword").value;

    // 1) Restrict to university emails
    if (!email.endsWith("@iub.edu.bd")) {
      showMessage("Only @iub.edu.bd emails allowed.", "signUpMessage");
      return;
    }

    try {
      // 2) Create user in Auth
      const { user } = await createUserWithEmailAndPassword(auth, email, password);

      // 3) Store user profile in Firestore
      const userData = { firstName: fname, lastName: lname, email };
      await setDoc(doc(db, "users", user.uid), userData);

      // 4) Send verification email (OTP link)
      await sendEmailVerification(user);
      showMessage("Verification email sent—please check your inbox.", "showUpMessage");

      // 5) Show “Resend” button in case they need another link
      if (resendBtn) {
        resendBtn.style.display = "inline-block";
        resendBtn.addEventListener("click", async () => {
          await sendEmailVerification(auth.currentUser);
          showMessage("Verification email resent!", "showUpMessage");
        });
      }

    } catch (error) {
      console.error("Signup error:", error.code, error.message);
      if (error.code === "auth/email-already-in-use") {
        showMessage("That email is already in use.", "signUpMessage");
      } else if (error.code === "auth/invalid-email") {
        showMessage("Invalid email address.", "signUpMessage");
      } else if (error.code === "auth/weak-password") {
        showMessage("Password must be at least 6 characters.", "signUpMessage");
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

      // 6) Block login if email not verified
      if (!user.emailVerified) {
        showMessage("Please verify your email before signing in.", "signInMessage");
        return;
      }

      // 7) Redirect to dashboard
      window.location.href = "dashboard.html";

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
      showMessage(msg, "signInMessage");
    }
  });
}
// ——— FORGOT PASSWORD ———
const forgotLink = document.getElementById("forgotPassword");
if (forgotLink) {
  forgotLink.addEventListener("click", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    if (!email) {
      showMessage("Please enter your email above first.", "resetPasswordMessage");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      showMessage("Password reset email sent—check your inbox.", "resetPasswordMessage");
    } catch (error) {
      console.error("Reset password error:", error.code, error.message);
      let msg = "Could not send reset email.";
      if (error.code === "auth/invalid-email") {
        msg = "Invalid email address.";
      } else if (error.code === "auth/user-not-found") {
        msg = "No account found with that email.";
      }
      showMessage(msg, "resetPasswordMessage");
    }
  });
}