import { Routes } from '@angular/router';
import { LoginFormComponent } from './login-form/login-form.component';
import { TournamentComponent } from './event/tournament.component';
import { CategoryComponent } from './category/category-component';
import { EvaluationComponent } from './evaluation/evaluation-component';
import { TournamentSearchComponent } from './tournament-search/tournament-search.component';
import { AspectComponent } from './aspect/aspect-component';
import { EvaluatorComponent } from './evaluator/evaluator-component';
import { PerformanceComponent } from './performance/performance-component';
import { EvaluationGradeComponent } from './evaluationgrade/evaluationgrade-component';
import { MedalsListComponent } from './medals-list/medals-list.component';

export const routes: Routes = [
    { path:"loginForm",component:LoginFormComponent},    
    { path:"registerForm",component:LoginFormComponent},
    { path:"tournamentNew",component:TournamentComponent},
    { path:"tournament/:id",component:TournamentComponent},

    { path:"tournament/:tournamentId/categoryNew",component:CategoryComponent},     
    { path:"tournament/:tournamentId/category/:id",component:CategoryComponent},  

    { path:"tournament/:tournamentId/evaluationNew",component:EvaluationComponent},     
    { path:"tournament/:tournamentId/evaluation/:id",component:EvaluationComponent},  

    { path:"tournament/:tournamentId/evaluation/:evaluationId/aspectNew",component:AspectComponent},  
    { path:"tournament/:tournamentId/evaluation/:evaluationId/aspect/:id",component:AspectComponent}, 

    { path:"tournament/:tournamentId/evaluatorNew",component:EvaluatorComponent}, 
    { path:"tournament/:tournamentId/evaluator/:id",component:EvaluatorComponent}, 

    { path:"tournament/:tournamentId/performanceNew",component:PerformanceComponent},          
    { path:"tournament/:tournamentId/performance/:id",component:PerformanceComponent},          

    { path:"tournament/:tournamentId/evaluationgradeNew",component:EvaluationGradeComponent},          
    { path:"tournament/:tournamentId/evaluationgrade/:id",component:EvaluationGradeComponent}, 
    
    { path:"tournament/:tournamentId/performance/:performanceId/evaluationgrade/:id",component:EvaluationGradeComponent},

    { path:"tournament/:tournamentId/medals",component:MedalsListComponent},

    
    { path:"",pathMatch:'full',component:TournamentSearchComponent}

];
