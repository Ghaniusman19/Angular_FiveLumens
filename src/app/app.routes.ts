import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Layout } from './pages/layout/layout';
import { Dashboard } from './pages/dashboard/dashboard';
import { authLoginGuard } from '../auth-login-guard';
import { Scorecard } from './pages/scorecard/scorecard';
import { Scorecardnew } from './pages/scorecardnew/scorecardnew';
import { Viewscorecard } from './pages/viewscorecard/viewscorecard';
import { Editscorecard } from './pages/editscorecard/editscorecard';
import { Addscorecard } from './pages/addscorecard/addscorecard';
export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'scorecard', component: Scorecard, canActivate: [authLoginGuard] },
  { path: 'scorecardnew', component: Scorecardnew, canActivate: [authLoginGuard] },
  { path: 'view', component: Viewscorecard, canActivate: [authLoginGuard] },
  { path: 'edit', component: Editscorecard, canActivate: [authLoginGuard] },
  { path: 'add', component: Addscorecard, canActivate: [authLoginGuard] },
  {
    path: '',
    component: Layout,
    children: [{ path: 'dashboard', component: Dashboard, canActivate: [authLoginGuard] }],
  },
];
