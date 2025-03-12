"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Navbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState(null);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      console.log("Checking user authentication...");

      const token = localStorage.getItem("auth_token");

      if (!token) {
        console.log("No token found, setting user as NOT logged in.");
        setIsLoggedIn(false);
        setUserRole(null);
        setUserName(null);
        return;
      }

      const response = await fetch("/api/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        console.log("User details:", data);
        setIsLoggedIn(true);
        setUserRole(data.role);
        setUserName(data.name);
      } else {
        console.error("Invalid session, logging out...");
        handleLogout();
      }
    } catch (error) {
      console.error("Error checking authentication:", error);
      setIsLoggedIn(false);
      setUserRole(null);
      setUserName(null);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/logout", { method: "POST" });

      if (response.ok) {
        console.log("Logout successful. Clearing session...");

        localStorage.removeItem("auth_token");
        document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

        setIsLoggedIn(false);
        setUserRole(null);
        setUserName(null);

        window.location.href = "/login";
      } else {
        alert("Logout failed, please try again.");
      }
    } catch (error) {
      console.error("Error logging out:", error);
      alert("Logout failed, please try again.");
    }
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-full mx-4 px-4">
        <div className="flex justify-between h-20">
          <div className="flex-shrink-0 flex items-center">
            {/* <Link href="/" className="flex items-center pl-3">
              <Logo />
            </Link> */}
          </div>

          <div className="flex items-center space-x-3 pr-4">
            {isLoggedIn && (
              <>
                {userRole === "ADMIN" && (
                  <>
                    <Link
                      href="/victiminsert"
                      className="text-gray-600 hover:text-gray-900 text-sm px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Data Entry
                    </Link>
                    <Link
                      href="/crud"
                      className="text-gray-600 hover:text-gray-900 text-sm px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Modify
                    </Link>
                  </>
                )}
                <span className="text-sm font-medium text-gray-900">
                  Welcome, {userName || "User"}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 border border-gray-300 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50 text-sm"
                >
                  Logout
                </button>
              </>
            )}

            {!isLoggedIn && (
              <>
                <Link
                  href="/login"
                  className="px-3 py-1.5 border border-gray-300 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50 text-sm"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
