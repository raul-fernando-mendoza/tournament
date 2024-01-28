import { Routes } from '@angular/router';
import { LoginFormComponent } from './login-form/login-form.component';
import { TournamentComponent } from './tournament/tournament.component';
import { TournamentSearchComponent } from './tournament-search/tournament-search.component';
import { EvaluatorComponent } from './evaluator/evaluator-component';
import { PerformanceComponent } from './performance/performance-component';
import { EvaluationGradeComponent } from './evaluationgrade/evaluationgrade-component';
import { MedalsListComponent } from './medals-list/medals-list.component';
import { CategoryListComponent } from './category-list/category-list.component';
import { EvaluationListComponent } from './evaluation-list/evaluation-list.component';

export const routes: Routes = [
    { path:"loginForm",component:LoginFormComponent},    
    { path:"registerForm",component:LoginFormComponent},
    { path:"tournamentNew",component:TournamentComponent},
    { path:"tournament/:id",component:TournamentComponent},

    { path:"tournament/:tournamentId/evaluatorNew",component:EvaluatorComponent}, 
    { path:"tournament/:tournamentId/evaluator/:id",component:EvaluatorComponent}, 

    { path:"tournament/:tournamentId/performanceNew",component:PerformanceComponent},          
    { path:"tournament/:tournamentId/performance/:id",component:PerformanceComponent},          

    { path:"tournament/:tournamentId/evaluationgradeNew",component:EvaluationGradeComponent},          
    { path:"tournament/:tournamentId/evaluationgrade/:id",component:EvaluationGradeComponent}, 
    
    { path:"tournament/:tournamentId/performance/:performanceId/evaluationgrade/:id",component:EvaluationGradeComponent},

    { path:"tournament/:tournamentId/medals",component:MedalsListComponent},
    
    { path:"tournament/:tournamentId/categories",component:CategoryListComponent},
    { path:"tournament/:tournamentId/evaluations",component:EvaluationListComponent},

    
    { path:"",pathMatch:'full',component:TournamentSearchComponent}

];
