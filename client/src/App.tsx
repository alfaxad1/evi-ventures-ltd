import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";

import BasicTables from "./pages/Tables/BasicTables";

import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import Customers from "./pages/DataPages/Customers";
import Loans from "./pages/DataPages/Loans";
import CustomersForm from "./pages/DataPages/CustomersForm";
import PendingLoans from "./pages/DataPages/PendingLoans";
import RejectedLoans from "./pages/DataPages/RejectedLoans";
import LoanApplication from "./pages/DataPages/LoanApplication";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route index path="/" element={<Home />} />

            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />

            <Route path="/blank" element={<Blank />} />

            {/* Forms */}

            {/* Tables */}
            <Route path="/basic-tables" element={<BasicTables />} />

            {/* Ui Elements */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />
            {/* Data pages */}
            <Route path="/customers" element={<Customers />} />

            <Route path="/loans" element={<Loans />} />
            <Route path="/register-customer" element={<CustomersForm />} />
            <Route path="/pending-loans" element={<PendingLoans />} />
            <Route path="/rejected-loans" element={<RejectedLoans />} />
            <Route path="/loan-application" element={<LoanApplication />} />
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Not Found */}

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
