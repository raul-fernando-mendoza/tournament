import { CanActivateFn, Router, Routes } from '@angular/router';
import { LoginFormComponent } from './login-form/login-form.component';
import { TournamentComponent } from './tournament/tournament.component';
import { TournamentSearchComponent } from './tournament-search/tournament-search.component';
import { EvaluationGradeComponent } from './evaluationgrade/evaluationgrade-component';
import { MedalsListComponent } from './medals-list/medals-list.component';
import { CategoryListComponent } from './category-list/category-list.component';
import { EvaluationListComponent } from './evaluation-list/evaluation-list.component';
import { JurorListComponent } from './juror-list/juror-list.component';
import { PerformanceListComponent } from './performance-list/performance-list.component';
import { AspectListComponent } from './aspect-list/aspect-list.component';
import { ProgramListComponent } from './program-list/program-list.component';
import { PodiumListComponent } from './podium-list/podium-list.component';
import { ProfileComponent } from './profile/profile.component';
import { TournamentListComponent } from './tournament-list/tournament-list.component';
import { WelcomeJurorComponent } from './welcome-juror/welcome-juror.component';
import { AuthService } from './auth.service';
import { inject } from '@angular/core';

export function loginGuard(
    redirectRoute: string
  ): CanActivateFn {
    return () => {
      const oauthService: AuthService = inject(AuthService);
      const router: Router = inject(Router);
      
      const isFlagEnabled = oauthService.isloggedIn()
      return isFlagEnabled || router.createUrlTree([redirectRoute]);
    };
  }

export const routes: Routes = [
    { path:"loginForm/:intendedPath",component:LoginFormComponent}, 
    { path:"loginForm",component:LoginFormComponent},    
    { path:"registerForm",component:LoginFormComponent},
    { path:"tournamentNew",component:TournamentComponent},
    { path:"tournament/:id",component:TournamentComponent},

//    { path:"tournament/:tournamentId/evaluationgradeNew",component:EvaluationGradeComponent},          
//    { path:"tournament/:tournamentId/evaluationGrade/:id",component:EvaluationGradeComponent}, 
    
    { path:"tournament/:tournamentId/performance/:performanceId/evaluationGrade/:evaluationGradeId",component:EvaluationGradeComponent},

    { path:"tournament/:tournamentId/medals",component:MedalsListComponent},
    
    
    { path:"tournament/:tournamentId/categories",component:CategoryListComponent},
    { path:"tournament/:tournamentId/evaluation",component:EvaluationListComponent},
    { path:"tournament/:tournamentId/evaluation/:evaluationId",component:AspectListComponent},

    { path:"tournament/:tournamentId/jurors",component:JurorListComponent},
    { path:"tournament/:tournamentId/performances",component:PerformanceListComponent},
    { path:"tournament/:tournamentId/program",component:ProgramListComponent},
    { path:"tournament/:tournamentId/podium",component:PodiumListComponent},
    
    
    { path:"participant",pathMatch:'full',component:TournamentSearchComponent},
    { path:"juror",pathMatch:'full',component:WelcomeJurorComponent, canActivate: [loginGuard('loginForm/juror')]},
    { path:"organizer",pathMatch:'full',component:TournamentListComponent},
    
    { path:"home",pathMatch:'full',component:ProfileComponent},    
    { path:"",pathMatch:'full',component:ProfileComponent}

];
