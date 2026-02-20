import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useClerk, useUser } from "@clerk/clerk-react";
import { appShellStyles } from "../assets/dummyStyles";
import logo from "../assets/logo.png";

const AppShell = () => {
  const navigate = useNavigate();
  const { signOut } = useClerk();
  const { user } = useUser();

  const [collapsed, setCollapsed] = useState(false);

  const displayName =
    user?.firstName || user?.fullName || user?.username || "User";

    // initials
  const initials = () => {
    if (!displayName) return "U";
    const parts = displayName.split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (
      parts[0][0] + parts[parts.length - 1][0]
    ).toUpperCase();
  };

  // icon wrapper
  const IconWrapper = ({ children }) => (
    <div className="w-10 h-10 flex items-center justify-center">
      {children}
    </div>
  );
// icons
  const DashboardIcon = ({ active }) => (
    <svg
      className={`w-5 h-5 ${
        active
          ? appShellStyles.sidebarIconActive
          : appShellStyles.sidebarIconInactive
      }`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 10.5L12 3l9 7.5" />
      <path d="M5 10v9a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1v-9" />
    </svg>
  );

  const InvoicesIcon = () => (
    <svg
      className={`w-5 h-5 ${appShellStyles.sidebarIconInactive}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.25"
    >
      <path d="M7 3h10a2 2 0 012 2v14l-3-2-3 2-3-2-3 2V5a2 2 0 012-2z" />
    </svg>
  );

  const CreateInvoiceIcon = () => (
    <svg
      className={`w-5 h-5 ${appShellStyles.sidebarIconInactive}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.25"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );

  const BusinessProfileIcon = () => (
    <svg
      className={`w-5 h-5 ${appShellStyles.sidebarIconInactive}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.25"
    >
      <path d="M12 12a4 4 0 100-8 4 4 0 000 8z" />
      <path d="M6 20a6 6 0 0112 0" />
    </svg>
  );

  // jsx
  return (
    <div className={appShellStyles.root}>
      <div className={appShellStyles.layout}>
       {/* sidebar */}
        <aside
          className={`${appShellStyles.sidebar} ${
            collapsed
              ? appShellStyles.sidebarCollapsed
              : appShellStyles.sidebarExpanded
          }`}
        >
          <div className={appShellStyles.sidebarGradient} />

          <div className={appShellStyles.sidebarContainer}>
            {/* logo */}
            <div
              className={`${appShellStyles.logoContainer} ${
                collapsed && appShellStyles.logoContainerCollapsed
              }`}
            >
              <NavLink
                to="/app/dashboard"
                className={appShellStyles.logoLink}
              >
                <img
                  src={logo}
                  alt="logo"
                  className={appShellStyles.logoImage}
                />
                {!collapsed && (
                  <div>
                    <span className={appShellStyles.logoText}>
                      InvoiceAI
                    </span>
                    <div className={appShellStyles.logoUnderline} />
                  </div>
                )}
              </NavLink>

              <button
                onClick={() => setCollapsed(!collapsed)}
                className={appShellStyles.collapseButton}
              >
                «
              </button>
            </div>

            {/* nav */}
            <nav className={appShellStyles.nav}>
              <NavLink
                to="/app/dashboard"
                className={({ isActive }) =>
                  `${appShellStyles.sidebarLink} ${
                    collapsed && appShellStyles.sidebarLinkCollapsed
                  } ${
                    isActive
                      ? appShellStyles.sidebarLinkActive
                      : appShellStyles.sidebarLinkInactive
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <IconWrapper>
                      <DashboardIcon active={isActive} />
                    </IconWrapper>
                    {!collapsed && (
                      <span className={appShellStyles.sidebarText}>
                        Dashboard
                      </span>
                    )}
                  </>
                )}
              </NavLink>

              <NavLink
                to="/app/invoices"
                className={({ isActive }) =>
                  `${appShellStyles.sidebarLink} ${
                    collapsed && appShellStyles.sidebarLinkCollapsed
                  } ${
                    isActive
                      ? appShellStyles.sidebarLinkActive
                      : appShellStyles.sidebarLinkInactive
                  }`
                }
              >
                <IconWrapper>
                  <InvoicesIcon />
                </IconWrapper>
                {!collapsed && "Invoices"}
              </NavLink>

              <NavLink
                to="/app/create-invoice"
                className={({ isActive }) =>
                  `${appShellStyles.sidebarLink} ${
                    collapsed && appShellStyles.sidebarLinkCollapsed
                  } ${
                    isActive
                      ? appShellStyles.sidebarLinkActive
                      : appShellStyles.sidebarLinkInactive
                  }`
                }
              >
                <IconWrapper>
                  <CreateInvoiceIcon />
                </IconWrapper>
                {!collapsed && "Create Invoice"}
              </NavLink>

              <NavLink
                to="/app/business"
                className={({ isActive }) =>
                  `${appShellStyles.sidebarLink} ${
                    collapsed && appShellStyles.sidebarLinkCollapsed
                  } ${
                    isActive
                      ? appShellStyles.sidebarLinkActive
                      : appShellStyles.sidebarLinkInactive
                  }`
                }
              >
                <IconWrapper>
                  <BusinessProfileIcon />
                </IconWrapper>
                {!collapsed && "Business Profile"}
              </NavLink>
            </nav>

            {/* logout */}
            <div className={appShellStyles.userSection}>
              <div className={appShellStyles.userDivider}>
                <button
                  onClick={() => signOut({ redirectUrl: "/" })}
                  className={appShellStyles.logoutButton}
                >
                  <IconWrapper>
                    <svg
                      className={appShellStyles.logoutIcon}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="1.25"
                    >
                      <path d="M15 12H3" />
                      <path d="M6 9l-3 3 3 3" />
                      <path d="M21 12a9 9 0 11-9-9" />
                    </svg>
                  </IconWrapper>
                  {!collapsed && "Logout"}
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* main */}
        <div className="flex-1 min-w-0" style={{
          position:"relative", zIndex:20
        }}>
          <header className={appShellStyles.header}>
            <div className={appShellStyles.headerContent}>
              <div className={appShellStyles.welcomeContainer}>
                <h2 className={appShellStyles.welcomeTitle}>
                  Welcome back,{" "}
                  <span className={appShellStyles.welcomeName}>
                    {displayName}
                  </span>
                </h2>
                <p className={appShellStyles.welcomeSubtitle}>
                  Ready to create amazing invoices?
                </p>
              </div>
            </div>

            <div className={appShellStyles.headerActions}>
              <button
                onClick={() => navigate("/app/create-invoice")}
                className={appShellStyles.ctaButton}
              >
                <svg
                  className={appShellStyles.ctaIcon}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
                <span className="hidden sm:inline">
                  Create Invoice
                </span>
                <span className="sm:hidden">Create</span>
              </button>

              <div className={appShellStyles.userSectionDesktop}>
                <div className={appShellStyles.userInfo}>
                  <div className={appShellStyles.userName}>
                    {displayName}
                  </div>
                  <div className={appShellStyles.userEmail}>
                    {user?.primaryEmailAddress?.emailAddress}
                  </div>
                </div>

                <div className={appShellStyles.userAvatarContainer}>
                  <div className={appShellStyles.userAvatar}>
                    {initials()}
                    <div
                      className={appShellStyles.userAvatarBorder}
                    />
                  </div>
                  <div className={appShellStyles.userStatus} />
                </div>
              </div>
            </div>
          </header>

          <main className={appShellStyles.main}>
            <div className={appShellStyles.mainContainer}>
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AppShell;
