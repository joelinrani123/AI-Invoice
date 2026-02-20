import React from "react";
import { Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import AppShell from "./components/AppShell";
import Invoices from "./pages/Invoices";
import CreateInvoice from "./pages/CreateInvoice";
import InvoicePreview from "./components/InvoicePreview";
import BusinessProfile from "./pages/BusinessProfile";
import Notfound from "./pages/Notfound";
import {
  SignedIn,
  SignedOut,
  RedirectToSignIn,
} from "@clerk/clerk-react";

const ClerkProtected = ({ children }) => (
  <>
    <SignedIn>{children}</SignedIn>
    <SignedOut>
      <RedirectToSignIn />
    </SignedOut>
  </>
);

const App = () => {
  return (
    <div className="min-h-screen max-w-full overflow-x-hidden">
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Home />} />

        {/* Protected App Routes */}
        <Route
          path="/app"
          element={
            <ClerkProtected>
              <AppShell />
            </ClerkProtected>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />

          <Route path="invoices" element={<Invoices />} />
          <Route path="invoices/new" element={<CreateInvoice />} />
          <Route path="invoices/:id" element={<InvoicePreview />} />
          <Route path="invoices/:id/preview" element={<InvoicePreview />} />
          <Route path="invoices/:id/edit" element={<InvoicePreview />} />

          <Route path="create-invoice" element={<CreateInvoice />} />
          <Route path="business" element={<BusinessProfile />} />
        </Route>

        <Route path="*" element={<Notfound />} />
      </Routes>
    </div>
  );
};

export default App;
