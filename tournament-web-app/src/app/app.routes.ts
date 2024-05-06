import { CanActivateFn, Router, Routes } from '@angular/router';
import { LoginFormComponent } from './login-form/login-form.component';
import { AdminTournamentComponent } from './admin-tournament/admin-tournament.component';
import { TournamentSearchComponent } from './tournament-search/tournament-search.component';
import { EvaluationGradeComponent } from './evaluationgrade/evaluationgrade-component';
import { MedalsListComponent } from './medals-list/medals-list.component';
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
    { path:"loginForm/:intendedPath",component:LoginFormComponent}, 
    { path:"loginForm",component:LoginFormComponent},    
    { path:"registerForm",component:LoginFormComponent},

    //{ path:"organizer",pathMatch:'full',component:AdminTournamentWelcomeComponent, canActivate: [loginGuard('loginForm/organizer')]},

    { path:"tournamentSetup/:id",component:AdminTournamentSetupComponent},  
    { path:"tournamentSetup/:tournamentId/categoryNew",component:CategoryNewComponent},
    { path:"tournamentSetup/:tournamentId/category/:categoryId",component:CategoryEditComponent},

    { path:"tournamentSetup/:tournamentId/evaluationNew",component:EvaluationNewComponent},
    { path:"tournamentSetup/:tournamentId/evaluation/:evaluationId",component:EvaluationEditComponent},
    
    { path:"tournamentSetup/:tournamentId/evaluationNew",component:EvaluationNewComponent},
    { path:"tournamentSetup/:tournamentId/evaluation/:evaluationId",component:EvaluationEditComponent},
    { path:"tournamentSetup/:tournamentId/evaluation/:evaluationId/aspectNew",component:AspectNewComponent},
    { path:"tournamentSetup/:tournamentId/evaluation/:evaluationId/aspect/:aspectId",component:AspectEditComponent},

    { path:"tournamentSetup/:tournamentId/jurorNew",component:JurorNewComponent},
    { path:"tournamentSetup/:tournamentId/juror/:jurorId",component:JurorEditComponent},

    { path:"tournamentSetup/:tournamentId/medalNew",component:MedalNewComponent},
    { path:"tournamentSetup/:tournamentId/medal/:medalId",component:MedalEditComponent},

    { path:"tournament/:tournamentId",component:TournamentRouterComponent},
    
    { path:"tournamentGuess/:tournamentId",component:GuessTournamentComponent},

    
    { path:"tournamentAdmin/:tournamentId",component:AdminTournamentComponent},
    
    { path:"tournamentAdmin/:tournamentId/categoryNew",component:CategoryNewComponent},
    { path:"tournamentAdmin/:tournamentId/category/:categoryId",component:CategoryEditComponent},

    { path:"tournamentAdmin/:tournamentId/evaluationNew",component:EvaluationNewComponent},
    { path:"tournamentAdmin/:tournamentId/evaluation/:evaluationId",component:EvaluationEditComponent},
    
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

    { path:"tournament/:tournamentId/medals",pathMatch:'full',component:MedalsListComponent},    
    
    { path:"participant",pathMatch:'full',component:TournamentSearchComponent},
    { path:"tournamentJuror/:tournamentId",pathMatch:'full',component:WelcomeJurorComponent},
    { path:"tournamentJuror/:tournamentId/performance/:performanceId/evaluationGrade/:evaluationGradeId",pathMatch:'full',component:EvaluationGradeComponent},
    
    
    { path:"home",pathMatch:'full',component:AdminTournamentComponent},    


    { path:"",pathMatch:'full',component:AdminTournamentWelcomeComponent},

    {path:"**", component:NotfoundComponent}



];
