import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser, useAuth, useClerk } from "@clerk/clerk-react";

import { navbarStyles } from "../assets/dummyStyles";
import logo from "../assets/logo.png";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  const { user } = useUser();
  const { isSignedIn, getToken } = useAuth();
  const clerk = useClerk();
  const navigate = useNavigate();

  const TOKEN_KEY = "token";

  // token sync
  const fetchAndStoreToken = useCallback(
    async (options = {}) => {
      try {
        if (!getToken) return null;
        const token = await getToken(options).catch(() => null);
        if (token) {
          try {
            localStorage.setItem(TOKEN_KEY, token);
          } catch {}
          return token;
        }
        return null;
      } catch {
        return null;
      }
    },
    [getToken]
  );

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (isSignedIn) {
        const token = await fetchAndStoreToken({ template: "default" });
        if (!token && mounted) {
          await fetchAndStoreToken({ forceRefresh: true });
        }
      } else {
        try {
          localStorage.removeItem(TOKEN_KEY);
        } catch {}
      }
    })();

    return () => {
      mounted = false;
    };
  }, [isSignedIn, user, fetchAndStoreToken]);

  // redirect after login
  useEffect(() => {
    if (!isSignedIn) return;

    const path = window.location.pathname || "/";
    if (path === "/" || path === "/login" || path === "/signup") {
      navigate("/app/dashboard", { replace: true });
    }
  }, [isSignedIn, navigate]);

  // auth action
  const openSignIn = () => {
    try {
      if (clerk?.openSignIn) clerk.openSignIn();
      else navigate("/login");
    } catch {
      navigate("/login");
    }
  };

  const openSignUp = () => {
    try {
      if (clerk?.openSignUp) clerk.openSignUp();
      else navigate("/signup");
    } catch {
      navigate("/signup");
    }
  };

  // ui
  return (
    <header className={navbarStyles.header}>
      <div className={navbarStyles.container}>
        <nav className={navbarStyles.nav}>
          {/* LEFT */}
          <div className={navbarStyles.logoSection}>
            <Link to="/" className={navbarStyles.logoLink}>
              <img src={logo} alt="InvoiceAI" className={navbarStyles.logoImage} />
              <span className={navbarStyles.logoText}>InvoiceAI</span>
            </Link>

            <div className={navbarStyles.desktopNav}>
              <a href="#features" className={navbarStyles.navLink}>
                Features
              </a>
              <a href="#pricing" className={navbarStyles.navLink}>
                Pricing
              </a>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-4">
            {!isSignedIn && (
              <div className={navbarStyles.authSection}>
                <button
                  onClick={openSignIn}
                  className={navbarStyles.signInButton}
                  type="button"
                >
                  Sign in
                </button>

                <button
                  onClick={openSignUp}
                  className={navbarStyles.signUpButton}
                  type="button"
                >
                  <div className={navbarStyles.signUpOverlay} />
                  <span className={navbarStyles.signUpText}>
                    Get Started
                  </span>

                  <svg
                    className={navbarStyles.signUpIcon}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14m-7-7l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}

            {/* MOBILE TOGGLE */}
            <button
              onClick={() => setOpen(!open)}
              className={navbarStyles.mobileMenuButton}
            >
              <div className={navbarStyles.mobileMenuIcon}>
                <span
                  className={`${navbarStyles.mobileMenuLine1} ${
                    open
                      ? navbarStyles.mobileMenuLine1Open
                      : navbarStyles.mobileMenuLine1Closed
                  }`}
                />
                <span
                  className={`${navbarStyles.mobileMenuLine2} ${
                    open
                      ? navbarStyles.mobileMenuLine2Open
                      : navbarStyles.mobileMenuLine2Closed
                  }`}
                />
                <span
                  className={`${navbarStyles.mobileMenuLine3} ${
                    open
                      ? navbarStyles.mobileMenuLine3Open
                      : navbarStyles.mobileMenuLine3Closed
                  }`}
                />
              </div>
            </button>
          </div>
        </nav>
      </div>

      {/* mobile menu */}
      <div
        className={`${open ? "block" : "hidden"} ${
          navbarStyles.mobileMenu
        }`}
      >
        <div className={navbarStyles.mobileMenuContainer}>
          <a href="#features" className={navbarStyles.mobileNavLink}>
            Features
          </a>
          <a href="#pricing" className={navbarStyles.mobileNavLink}>
            Pricing
          </a>

          {!isSignedIn && (
            <div className={navbarStyles.mobileAuthSection}>
              <button
                onClick={openSignIn}
                className={navbarStyles.mobileSignIn}
              >
                Sign in
              </button>

              <button
                onClick={openSignUp}
                className={navbarStyles.mobileSignIn}
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
