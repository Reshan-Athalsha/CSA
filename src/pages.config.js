/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import PoolsideCheckIn from './pages/PoolsideCheckIn';
import FamilyDashboard from './pages/FamilyDashboard';
import Swimmers from './pages/Swimmers';
import Meets from './pages/Meets';
import RaceTimes from './pages/RaceTimes';
import Notices from './pages/Notices';
import SwimmerStats from './pages/SwimmerStats';
import TrialRequests from './pages/TrialRequests';
import UserApproval from './pages/UserApproval';
import AppSettings from './pages/AppSettings';
import ParentLinking from './pages/ParentLinking';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Landing": Landing,
    "Login": Login,
    "Signup": Signup,
    "AdminDashboard": AdminDashboard,
    "PoolsideCheckIn": PoolsideCheckIn,
    "FamilyDashboard": FamilyDashboard,
    "Swimmers": Swimmers,
    "Meets": Meets,
    "RaceTimes": RaceTimes,
    "Notices": Notices,
    "SwimmerStats": SwimmerStats,
    "TrialRequests": TrialRequests,
    "UserApproval": UserApproval,
    "AppSettings": AppSettings,
    "ParentLinking": ParentLinking,
}

export const pagesConfig = {
    mainPage: "Landing",
    Pages: PAGES,
    Layout: __Layout,
};