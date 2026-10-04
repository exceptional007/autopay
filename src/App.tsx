import React, { useState, useEffect, Suspense, lazy } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User
} from "firebase/auth";
import { getFirebaseAuth } from "./firebase";
import { useAppRouter } from "./useAppRouter";
import { syncNewUserToStats } from "./services/statsService";

// Route-level code splitting: Defer heavy views until their route is active
const LandingPage = lazy(() =>
  import("./components/landing/LandingPage").then((m) => ({ default: m.LandingPage }))
);
const AuthView = lazy(() =>
  import("./components/AuthView").then((m) => ({ default: m.AuthView }))
);
const TrackerView = lazy(() =>
  import("./components/TrackerView").then((m) => ({ default: m.TrackerView }))
);

function RouteLoadingFallback() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0F19] flex items-center justify-center p-4 transition-colors">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#10B981] flex items-center justify-center shadow-lg shadow-[#10B981]/20 animate-pulse">
          <svg className="w-5 h-5 text-white transform rotate-45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="3 11 22 2 13 21 11 13 3 11" />
          </svg>
        </div>
        <span className="font-mono text-xs text-[#6B7280] dark:text-[#94A3B8] animate-pulse">
          Loading AutoPay...
        </span>
      </div>
    </div>
  );
}

export default function App() {
  const { currentPath, navigate } = useAppRouter();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("theme");
      // Light mode is the default for every user unless explicitly set to 'dark'
      return saved === "dark";
    } catch {
      return false;
    }
  });
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authTab, setAuthTab] = useState<"signin" | "signup">("signin");
  const [emailInput, setEmailInput] = useState<string>("");
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authActionLoading, setAuthActionLoading] = useState<boolean>(false);

  // Sync theme with HTML root class and browser theme-color meta tag
  useEffect(() => {
    const root = window.document.documentElement;
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (isDarkMode) {
      root.classList.add("dark");
      if (metaThemeColor) {
        metaThemeColor.setAttribute("content", "#0B0F19");
      }
    } else {
      root.classList.remove("dark");
      if (metaThemeColor) {
        metaThemeColor.setAttribute("content", "#FAFAFA");
      }
    }
  }, [isDarkMode]);

  // Synchronize theme changes across open tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "theme") {
        setIsDarkMode(e.newValue === "dark");
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Firebase Auth observer with safety timeout to prevent infinite splash screen
  useEffect(() => {
    let isMounted = true;
    const fallbackTimer = setTimeout(() => {
      if (isMounted) {
        setAuthLoading(false);
      }
    }, 6000);

    try {
      const auth = getFirebaseAuth();
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (!isMounted) return;
        clearTimeout(fallbackTimer);
        setUser(firebaseUser);
        setAuthLoading(false);
      });
      return () => {
        isMounted = false;
        clearTimeout(fallbackTimer);
        unsubscribe();
      };
    } catch {
      clearTimeout(fallbackTimer);
      setAuthLoading(false);
    }
  }, []);

  // Sync active auth tab based on route
  useEffect(() => {
    if (currentPath === "/signup") {
      setAuthTab("signup");
    } else if (currentPath === "/login") {
      setAuthTab("signin");
    }
  }, [currentPath]);

  // Centralized Route Protection & Automatic Redirection Logic
  useEffect(() => {
    // Never make routing decisions while Firebase auth session is restoring
    if (authLoading) return;

    if (user) {
      const search = window.location.search;
      const isExplicitLanding = search.includes("view=landing") || currentPath === "/landing";

      // If at "/login" or "/signup", or at "/" WITHOUT explicit view=landing, redirect to "/app"
      if (!isExplicitLanding && (currentPath === "/" || currentPath === "/login" || currentPath === "/signup")) {
        navigate("/app" + search, true);
      }
    } else {
      // Unauthenticated user:
      // Only redirect to /login if auth=required is explicitly passed
      if ((currentPath === "/app" || currentPath === "/dashboard") && window.location.search.includes("auth=required")) {
        navigate("/login", true);
      }
    }
  }, [user, authLoading, currentPath, navigate]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("theme", next ? "dark" : "light");
      } catch (e) {
        console.warn("Unable to save theme preference:", e);
      }
      return next;
    });
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!emailInput || !passwordInput) {
      setAuthError("Please fill in all fields.");
      return;
    }
    setAuthActionLoading(true);
    try {
      const auth = getFirebaseAuth();
      if (authTab === "signin") {
        await signInWithEmailAndPassword(auth, emailInput.trim(), passwordInput);
      } else {
        await createUserWithEmailAndPassword(auth, emailInput.trim(), passwordInput);
        syncNewUserToStats().catch(() => {});
      }
      setEmailInput("");
      setPasswordInput("");
      // Redirect directly to the main expense dashboard
      navigate("/app", true);
    } catch (err: any) {
      console.error("Authentication error:", err);
      let errMsg = "Authentication failed. Please try again.";
      if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential"
      ) {
        errMsg = "Invalid email or password.";
      } else if (err.code === "auth/email-already-in-use") {
        errMsg = "Email is already registered.";
      } else if (err.code === "auth/weak-password") {
        errMsg = "Password should be at least 6 characters.";
      } else if (err.code === "auth/invalid-email") {
        errMsg = "Invalid email address format.";
      }
      setAuthError(errMsg);
    } finally {
      setAuthActionLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setAuthError(null);
    setAuthActionLoading(true);
    try {
      const auth = getFirebaseAuth();
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // Redirect directly to the main expense dashboard
      navigate("/app", true);
    } catch {
      setAuthError("Google sign-in failed. Please try again or use Email/Password.");
    } finally {
      setAuthActionLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const auth = getFirebaseAuth();
      await signOut(auth);
      setUser(null);
      // Clear session and return to the public landing page
      navigate("/", true);
    } catch (err) {
      console.error("Sign out error:", err);
      setUser(null);
      navigate("/", true);
    }
  };

  // 1. Initial State: While checking session restoration, display splash loader to prevent layout flashing
  if (authLoading) {
    return <RouteLoadingFallback />;
  }

  // Check if landing page was explicitly requested (e.g. from Home button inside TrackerView)
  const isExplicitLanding = typeof window !== "undefined" && (
    window.location.search.includes("view=landing") || currentPath === "/landing"
  );

  // 2. Landing Page Route:
  // Rendered for unauthenticated visitors at "/", or when an authenticated user explicitly clicks Home
  if (currentPath === "/landing" || (currentPath === "/" && (!user || isExplicitLanding))) {
    return (
      <Suspense fallback={<RouteLoadingFallback />}>
        <LandingPage
          onNavigateLogin={() => navigate("/login")}
          onNavigateSignup={() => navigate("/signup")}
          onNavigateApp={() => navigate("/app")}
          onSignOut={handleSignOut}
          isAuthenticated={!!user}
          userEmail={user?.email}
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
        />
      </Suspense>
    );
  }

  // 3. Authenticated or Direct App Route: Open the main expense dashboard (supports guest mode via local device ID)
  if (user || currentPath === "/app" || (typeof window !== "undefined" && window.location.search.includes("view=app"))) {
    return (
      <Suspense fallback={<RouteLoadingFallback />}>
        <TrackerView
          user={user}
          onSignOut={handleSignOut}
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
          onNavigateHome={() => navigate("/?view=landing")}
        />
      </Suspense>
    );
  }

  // 4. Unauthenticated Routes:
  // Login / Signup Auth view at "/login" or "/signup"
  if (currentPath === "/login" || currentPath === "/signup") {
    return (
      <Suspense fallback={<RouteLoadingFallback />}>
        <AuthView
          authTab={authTab}
          setAuthTab={(tab) => {
            setAuthTab(tab);
            navigate(tab === "signup" ? "/signup" : "/login", true);
          }}
          emailInput={emailInput}
          setEmailInput={setEmailInput}
          passwordInput={passwordInput}
          setPasswordInput={setPasswordInput}
          authError={authError}
          authActionLoading={authActionLoading}
          handleEmailAuth={handleEmailAuth}
          handleGoogleAuth={handleGoogleAuth}
          onNavigateHome={() => navigate("/")}
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
        />
      </Suspense>
    );
  }

  // Fallback to Public Landing Page
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <LandingPage
        onNavigateLogin={() => navigate("/login")}
        onNavigateSignup={() => navigate("/signup")}
        onNavigateApp={() => navigate("/app")}
        onSignOut={handleSignOut}
        isAuthenticated={false}
        userEmail={null}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
      />
    </Suspense>
  );
}
