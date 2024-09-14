import { ActivatedRoute, ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, Routes } from '@angular/router';
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
import { NotallowedComponent } from './notallowed/notallowed.component';

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

  export function loginGuard2(
    redirectRoute: string
  ): CanActivateFn {
    return (route:ActivatedRouteSnapshot,state:RouterStateSnapshot) => {
      route.url
      state.url

      const oauthService: AuthService = inject(AuthService);
      const router: Router = inject(Router);
      
      const isloggedIn = oauthService.isloggedIn()      

      if( isloggedIn ){
        return true
      }

      if( route.url.length > 1){
        let parameter1 = route.url[1]
        return router.createUrlTree([redirectRoute + "/" + parameter1])
      }
      else{
        return false
      }      
      
      
    };
  }  

  

export const routes: Routes = [
    { path:"loginForm/:intendedPath",pathMatch:'full',component:LoginFormComponent}, 
    { path:"loginForm",pathMatch:'full',component:LoginFormComponent},    
    { path:"registerForm",pathMatch:'full',component:LoginFormComponent},
    { path:"registerForm/:intendedPath",pathMatch:'prefix',component:LoginFormComponent},
    { path:"tournamentGuess/:tournamentId",pathMatch:'full',component:GuessTournamentComponent},    
    { path:"tournament/:tournamentId",pathMatch:'full',component:TournamentRouterComponent},    

    //{ path:"organizer",pathMatch:'full',component:AdminTournamentWelcomeComponent, canActivate: [loginGuard('loginForm/organizer')]},

    { path:"tournamentSetup/:id",pathMatch:'full',component:AdminTournamentSetupComponent, canActivate: [loginGuard('/loginForm/tournamentAdmin')]},  
    { path:"tournamentSetup/:tournamentId/categoryNew",pathMatch:'full',component:CategoryNewComponent, canActivate: [loginGuard('/loginForm/tournamentAdmin')]},
    { path:"tournamentSetup/:tournamentId/category/:categoryId",pathMatch:'full',component:CategoryEditComponent, canActivate: [loginGuard('/loginForm/tournamentAdmin')]},

    { path:"tournamentSetup/:tournamentId/evaluationNew",pathMatch:'full',component:EvaluationNewComponent, canActivate: [loginGuard('/loginForm/tournamentAdmin')]},
    { path:"tournamentSetup/:tournamentId/evaluation/:evaluationId",pathMatch:'full',component:EvaluationEditComponent, canActivate: [loginGuard('/loginForm/tournamentAdmin')]},
    
    { path:"tournamentSetup/:tournamentId/evaluationNew",pathMatch:'full',component:EvaluationNewComponent, canActivate: [loginGuard('/loginForm/tournamentAdmin')]},
    { path:"tournamentSetup/:tournamentId/evaluation/:evaluationId",pathMatch:'full',component:EvaluationEditComponent, canActivate: [loginGuard('/loginForm/tournamentAdmin')]},
    { path:"tournamentSetup/:tournamentId/evaluation/:evaluationId/aspectNew",pathMatch:'full',component:AspectNewComponent, canActivate: [loginGuard('/loginForm/tournamentAdmin')]},
    { path:"tournamentSetup/:tournamentId/evaluation/:evaluationId/aspect/:aspectId",pathMatch:'full',component:AspectEditComponent, canActivate: [loginGuard('/loginForm/tournamentAdmin')]},

    { path:"tournamentSetup/:tournamentId/jurorNew",pathMatch:'full',component:JurorNewComponent, canActivate: [loginGuard('/loginForm/tournamentAdmin')]},
    { path:"tournamentSetup/:tournamentId/juror/:jurorId",pathMatch:'full',component:JurorEditComponent, canActivate: [loginGuard('/loginForm/tournamentAdmin')]},

    { path:"tournamentSetup/:tournamentId/medalNew",pathMatch:'full',component:MedalNewComponent, canActivate: [loginGuard('/loginForm/tournamentAdmin')]},
    { path:"tournamentSetup/:tournamentId/medal/:medalId",pathMatch:'full',component:MedalEditComponent, canActivate: [loginGuard('/loginForm/tournamentAdmin')]},


    


    
    { path:"tournamentAdmin/:tournamentId",pathMatch:'full',component:AdminTournamentComponent, canActivate: [loginGuard('/loginForm/tournamentAdmin')]},
    
    { path:"tournamentAdmin/:tournamentId/categoryNew",pathMatch:'full',component:CategoryNewComponent, canActivate: [loginGuard('/loginForm/tournamentAdmin')]},
    { path:"tournamentAdmin/:tournamentId/category/:categoryId",pathMatch:'full',component:CategoryEditComponent, canActivate: [loginGuard('/loginForm/tournamentAdmin')]},

    { path:"tournamentAdmin/:tournamentId/evaluationNew",pathMatch:'full',component:EvaluationNewComponent, canActivate: [loginGuard('/loginForm/tournamentAdmin')]},
    { path:"tournamentAdmin/:tournamentId/evaluation/:evaluationId",pathMatch:'full',component:EvaluationEditComponent, canActivate: [loginGuard('/loginForm/tournamentAdmin')]},
    
    { path:"tournamentAdmin/:tournamentId/evaluationNew",pathMatch:'full',component:EvaluationNewComponent, canActivate: [loginGuard('/loginForm/tournamentAdmin')]},
    { path:"tournamentAdmin/:tournamentId/evaluation/:evaluationId",pathMatch:'full',component:EvaluationEditComponent, canActivate: [loginGuard('/loginForm/tournamentAdmin')]},
    { path:"tournamentAdmin/:tournamentId/evaluation/:evaluationId/aspectNew",pathMatch:'full',component:AspectNewComponent, canActivate: [loginGuard('/loginForm/tournamentAdmin')]},
    { path:"tournamentAdmin/:tournamentId/evaluation/:evaluationId/aspect/:aspectId",pathMatch:'full',component:AspectEditComponent, canActivate: [loginGuard('/loginForm/tournamentAdmin')]},

    { path:"tournamentAdmin/:tournamentId/jurorNew",pathMatch:'full',component:JurorNewComponent, canActivate: [loginGuard('/loginForm/tournamentAdmin')]},
    { path:"tournamentAdmin/:tournamentId/juror/:jurorId",pathMatch:'full',component:JurorEditComponent, canActivate: [loginGuard('/loginForm/tournamentAdmin')]},

    { path:"tournamentAdmin/:tournamentId/medalNew",pathMatch:'full',component:MedalNewComponent, canActivate: [loginGuard('/loginForm/tournamentAdmin')]},
    { path:"tournamentAdmin/:tournamentId/medal/:medalId",pathMatch:'full',component:MedalEditComponent, canActivate: [loginGuard('/loginForm/tournamentAdmin')]},


    { path:"tournamentAdmin/:tournamentId/program",pathMatch:'full',component:ProgramListComponent, canActivate: [loginGuard('/loginForm/tournamentAdmin')]},

    { path:"tournamentAdmin/:tournamentId/performanceEdit/:performanceId",pathMatch:'full',component:PerformanceEditComponent, canActivate: [loginGuard('/loginForm/tournamentAdmin')]},

    { path:"tournamentAdmin/:tournamentId/performance/:performanceId/evaluationGrade/:evaluationGradeId",pathMatch:'full',component:EvaluationGradeComponent, canActivate: [loginGuard('/loginForm/tournamentAdmin')]},
    

   
    { path:"tournamentNew",pathMatch:'full',component:AdminTournamentSetupComponent, canActivate: [loginGuard2('tournamentGuess')]},

    { path:"tournamentParticipant/:tournamentId",pathMatch:'full',component:ParticipantTournamentComponent, canActivate: [loginGuard2('tournamentGuess')]},

    
    { path:"tournamentParticipant/:tournamentId/performanceNew",pathMatch:'full',component:PerformanceNewComponent, canActivate: [loginGuard2('tournamentGuess')]},
    { path:"tournamentParticipant/:tournamentId/performanceEdit/:performanceId",pathMatch:'full',component:PerformanceEditComponent, canActivate: [loginGuard2('tournamentGuess')]},

    { path:"tournament/:tournamentId/performance/:performanceId/evaluationGrade/:evaluationGradeId",pathMatch:'full',component:EvaluationGradeComponent, canActivate: [loginGuard2('tournamentGuess')]},

    { path:"tournamentJuror/:tournamentId",pathMatch:'full',component:WelcomeJurorComponent, canActivate: [loginGuard2('tournamentGuess')]},
    { path:"tournamentJuror/:tournamentId/performance/:performanceId/evaluationGrade/:evaluationGradeId",pathMatch:'full',component:EvaluationGradeComponent, canActivate: [loginGuard2('tournamentGuess')]},

    { path:"tournamentAdmin",pathMatch:'full',component:AdminTournamentWelcomeComponent, canActivate: [loginGuard('/loginForm/tournamentAdmin')]},

    { path:"about",pathMatch:'full',component:AboutComponent},

    { path:"privacy",pathMatch:'full',component:PrivacyComponent},

    { path:"",pathMatch:'full',component:HomeComponent},

    { path:"notallowed",pathMatch:'full',component:NotallowedComponent},

    {path:"**", component:NotfoundComponent}



];
