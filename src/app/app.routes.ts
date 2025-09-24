import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Layout } from './pages/layout/layout';
import { Dashboard } from './pages/dashboard/dashboard';
import { authLoginGuard } from '../auth-login-guard';
import { Scorecard } from './pages/scorecard/scorecard';
export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'scorecard', component: Scorecard, canActivate: [authLoginGuard] },
  {
    path: '',
    component: Layout,
    children: [{ path: 'dashboard', component: Dashboard, canActivate: [authLoginGuard] }],
  },
];
