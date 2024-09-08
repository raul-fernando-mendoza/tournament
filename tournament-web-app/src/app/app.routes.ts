import { CanActivateFn, Router, Routes } from '@angular/router';
import { LoginFormComponent } from './login-form/login-form.component';
import { AdminTournamentComponent } from './admin-tournament/admin-tournament.component';
import { EvaluationGradeComponent } from './evaluationgrade/evaluationgrade-component';
import { ProgramListComponent } from './program-list/program-list.component';
import { WelcomeJurorComponent } from './welcome-juror/welcome-juror.component';
import { AuthService } from './auth.service';
import { inject } from '@angular/core';
import { AdminTournamentWelcomeComponent } from './admin-welcome/admin-welcome.component';
import { ParticipantTournamentComponent } from './participant-tournament/participant-tournament.component';
import { CategoryNewComponent } from './category-new/category-new.component';
import { CategoryEditComponent } from './category-edit/category-edit.component';
import { EvaluationEditComponent } from './evaluation-edit/evaluation-edit.component';
import { EvaluationNewComponent } from './evaluation-new/evaluation-new.component';
import { AspectNewComponent } from './aspect-new/aspect-new.component';
import { AspectEditComponent } from './aspect-edit/aspect-edit.component';
import { JurorNewComponent } from './juror-new/juror-new.component';
import { JurorEditComponent } from './juror-edit/juror-edit.component';
import { MedalNewComponent } from './medal-new/medal-new.component';
import { MedalEditComponent } from './medal-edit/medal-edit.component';
import { AdminTournamentSetupComponent } from './admin-tournament-setup/admin-tournament-setup.component';
import { TournamentRouterComponent } from './tournament-router/tournament-router.component';
import { GuessTournamentComponent } from './guess-tournament/guess-tournament.component';
import { PerformanceNewComponent } from './performance-new/performance-new.component';
import { PerformanceEditComponent } from './performance-edit/performance-edit.component';
import { NotfoundComponent } from './notfound/notfound.component';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { PrivacyComponent } from './privacy/privacy.component';

export function loginGuard(
    redirectRoute: string
  ): CanActivateFn {
    return () => {
      const oauthService: AuthService = inject(AuthService);
      const router: Router = inject(Router);
      
      const isFlagEnabled = oauthService.isloggedIn()
      let val = isFlagEnabled || router.createUrlTree([redirectRoute]);
      console.log("Can activate:" + val)
      return isFlagEnabled || router.createUrlTree([redirectRoute]);
    };
  }

export const routes: Routes = [
    { path:"loginForm/:intendedPath",pathMatch:'full',component:LoginFormComponent}, 
    { path:"loginForm",pathMatch:'full',component:LoginFormComponent},    
    { path:"registerForm",pathMatch:'full',component:LoginFormComponent},

    //{ path:"organizer",pathMatch:'full',component:AdminTournamentWelcomeComponent, canActivate: [loginGuard('loginForm/organizer')]},

    { path:"tournamentSetup/:id",pathMatch:'full',component:AdminTournamentSetupComponent},  
    { path:"tournamentSetup/:tournamentId/categoryNew",pathMatch:'full',component:CategoryNewComponent},
    { path:"tournamentSetup/:tournamentId/category/:categoryId",pathMatch:'full',component:CategoryEditComponent},

    { path:"tournamentSetup/:tournamentId/evaluationNew",pathMatch:'full',component:EvaluationNewComponent},
    { path:"tournamentSetup/:tournamentId/evaluation/:evaluationId",pathMatch:'full',component:EvaluationEditComponent},
    
    { path:"tournamentSetup/:tournamentId/evaluationNew",pathMatch:'full',component:EvaluationNewComponent},
    { path:"tournamentSetup/:tournamentId/evaluation/:evaluationId",pathMatch:'full',component:EvaluationEditComponent},
    { path:"tournamentSetup/:tournamentId/evaluation/:evaluationId/aspectNew",pathMatch:'full',component:AspectNewComponent},
    { path:"tournamentSetup/:tournamentId/evaluation/:evaluationId/aspect/:aspectId",pathMatch:'full',component:AspectEditComponent},

    { path:"tournamentSetup/:tournamentId/jurorNew",pathMatch:'full',component:JurorNewComponent},
    { path:"tournamentSetup/:tournamentId/juror/:jurorId",pathMatch:'full',component:JurorEditComponent},

    { path:"tournamentSetup/:tournamentId/medalNew",pathMatch:'full',component:MedalNewComponent},
    { path:"tournamentSetup/:tournamentId/medal/:medalId",pathMatch:'full',component:MedalEditComponent},

    { path:"tournament/:tournamentId",pathMatch:'full',component:TournamentRouterComponent},
    
    { path:"tournamentGuess/:tournamentId",pathMatch:'full',component:GuessTournamentComponent},

    
    { path:"tournamentAdmin/:tournamentId",pathMatch:'full',component:AdminTournamentComponent},
    
    { path:"tournamentAdmin/:tournamentId/categoryNew",pathMatch:'full',component:CategoryNewComponent},
    { path:"tournamentAdmin/:tournamentId/category/:categoryId",pathMatch:'full',component:CategoryEditComponent},

    { path:"tournamentAdmin/:tournamentId/evaluationNew",pathMatch:'full',component:EvaluationNewComponent},
    { path:"tournamentAdmin/:tournamentId/evaluation/:evaluationId",pathMatch:'full',component:EvaluationEditComponent},
    
    { path:"tournamentAdmin/:tournamentId/evaluationNew",pathMatch:'full',component:EvaluationNewComponent},
    { path:"tournamentAdmin/:tournamentId/evaluation/:evaluationId",pathMatch:'full',component:EvaluationEditComponent},
    { path:"tournamentAdmin/:tournamentId/evaluation/:evaluationId/aspectNew",pathMatch:'full',component:AspectNewComponent},
    { path:"tournamentAdmin/:tournamentId/evaluation/:evaluationId/aspect/:aspectId",pathMatch:'full',component:AspectEditComponent},

    { path:"tournamentAdmin/:tournamentId/jurorNew",pathMatch:'full',component:JurorNewComponent},
    { path:"tournamentAdmin/:tournamentId/juror/:jurorId",pathMatch:'full',component:JurorEditComponent},

    { path:"tournamentAdmin/:tournamentId/medalNew",pathMatch:'full',component:MedalNewComponent},
    { path:"tournamentAdmin/:tournamentId/medal/:medalId",pathMatch:'full',component:MedalEditComponent},


    { path:"tournamentAdmin/:tournamentId/program",pathMatch:'full',component:ProgramListComponent},
    //{ path:"tournamentAdmin/:tournamentId/podium",pathMatch:'full',component:PodiumListComponent},
    { path:"tournamentAdmin/:tournamentId/performanceEdit/:performanceId",pathMatch:'full',component:PerformanceEditComponent},

    { path:"tournamentAdmin/:tournamentId/performance/:performanceId/evaluationGrade/:evaluationGradeId",pathMatch:'full',component:EvaluationGradeComponent},
    

   
    { path:"tournamentNew",pathMatch:'full',component:AdminTournamentSetupComponent},

    { path:"tournamentParticipant/:tournamentId",pathMatch:'full',component:ParticipantTournamentComponent},

    
    { path:"tournamentParticipant/:tournamentId/performanceNew",pathMatch:'full',component:PerformanceNewComponent},
    { path:"tournamentParticipant/:tournamentId/performanceEdit/:performanceId",pathMatch:'full',component:PerformanceEditComponent},

//    { path:"tournament/:tournamentId/evaluationgradeNew",component:EvaluationGradeComponent},          
//    { path:"tournament/:tournamentId/evaluationGrade/:id",component:EvaluationGradeComponent}, 
    { path:"tournament/:tournamentId/performance/:performanceId/evaluationGrade/:evaluationGradeId",pathMatch:'full',component:EvaluationGradeComponent},

    { path:"tournamentJuror/:tournamentId",pathMatch:'full',component:WelcomeJurorComponent},
    { path:"tournamentJuror/:tournamentId/performance/:performanceId/evaluationGrade/:evaluationGradeId",pathMatch:'full',component:EvaluationGradeComponent},

    { path:"tournamentAdmin",pathMatch:'full',component:AdminTournamentWelcomeComponent, canActivate: [loginGuard('/loginForm/tournamentAdmin')]},

    { path:"about",pathMatch:'full',component:AboutComponent},

    { path:"privacy",pathMatch:'full',component:PrivacyComponent},

    { path:"",pathMatch:'full',component:HomeComponent},

    {path:"**", component:NotfoundComponent}



];
