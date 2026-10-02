import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SignInComponent } from './pages/sign-in/sign-in.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', component: SignInComponent, pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}