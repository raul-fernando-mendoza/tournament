import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormArray, FormBuilder,  FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Evaluation, Tournament, TournamentCollection, TournamentObj } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { MatCardModule } from '@angular/material/card';
import { FirebaseFullService } from '../firebasefull.service';
import { Unsubscribe } from 'firebase/firestore';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-evaluation-list',
  standalone: true,
  imports: [
    CommonModule
    ,MatIconModule
    ,MatButtonModule      
    ,FormsModule
    ,ReactiveFormsModule
    ,MatFormFieldModule
    ,MatInputModule
    ,RouterModule
    ,MatCardModule    
  ], 
  templateUrl: './evaluation-list.component.html',
  styleUrl: './evaluation-list.component.css',

})
export class EvaluationListComponent{
  @Input() tournamentId:string | null = null
  @Input() tournament!:TournamentObj

  isAdmin = false
  isAdding = false

  unsubscribe:Unsubscribe | undefined = undefined

  constructor( public firebase:FirebaseFullService 
    ,private fb:FormBuilder
    ,private activatedRoute: ActivatedRoute    
    ,private router: Router
    ,private auth:AuthService
  ){

  }
  ngOnDestroy(): void {
    if( this.unsubscribe ){
      this.unsubscribe()
    }
  }

  onEvaluation(id:string){
    this.router.navigate(['/',TournamentCollection.collectionName,this.tournamentId,'evaluation',id])
  }



}
