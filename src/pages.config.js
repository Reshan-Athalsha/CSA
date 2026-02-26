/**
 * pages.config.js - Page routing configuration
 *
 * Pages are lazy-loaded (React.lazy) so each page is a separate JS chunk.
 * This dramatically reduces the initial bundle size on slow 3G connections —
 * only the code for the current page is downloaded on first load.
 *
 * THE ONLY EDITABLE VALUE: mainPage
 * Controls which page is the landing page (shown at "/").
 * The value must match a key in the PAGES object exactly.
 */
import { lazy } from 'react';
import __Layout from './Layout.jsx';

const Landing        = lazy(() => import('./pages/Landing'));
const Login          = lazy(() => import('./pages/Login'));
const Signup         = lazy(() => import('./pages/Signup'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const PoolsideCheckIn= lazy(() => import('./pages/PoolsideCheckIn'));
const FamilyDashboard= lazy(() => import('./pages/FamilyDashboard'));
const Swimmers       = lazy(() => import('./pages/Swimmers'));
const Meets          = lazy(() => import('./pages/Meets'));
const RaceTimes      = lazy(() => import('./pages/RaceTimes'));
const Notices        = lazy(() => import('./pages/Notices'));
const SwimmerStats   = lazy(() => import('./pages/SwimmerStats'));
const TrialRequests  = lazy(() => import('./pages/TrialRequests'));
const UserApproval   = lazy(() => import('./pages/UserApproval'));
const AppSettings    = lazy(() => import('./pages/AppSettings'));
const ParentLinking  = lazy(() => import('./pages/ParentLinking'));


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