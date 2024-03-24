import { CommonModule, ViewportScroller } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Route, Router, RouterModule } from '@angular/router';
import { QuillModule } from 'ngx-quill';
import { FirebaseService } from '../firebase.service';
import { Medal, Tournament, TournamentCollection, TournamentObj } from '../types';
import { v4 as uuidv4, v4 } from 'uuid';
import {MatGridListModule} from '@angular/material/grid-list';

@Component({
  selector: 'app-medal-new',
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
    ,QuillModule
    ,MatGridListModule    
  ],
  templateUrl: './medal-new.component.html',
  styleUrl: './medal-new.component.css'
})
export class MedalNewComponent {

  tournamentId!:string

  tournament:TournamentObj | null = null

  form = this.fb.group({
    id:[null],
    label:['',Validators.required],
    description:[''],
    minGrade:['',[Validators.required, Validators.min(0), Validators.max(10)]]
  })  
  
  constructor( public firebaseService:FirebaseService 
    ,private fb:FormBuilder
    ,private activatedRoute: ActivatedRoute     
    ,private router:Router
  ){
    var thiz = this
    this.activatedRoute.paramMap.subscribe({
        next(paramMap){
          let tournamentId = paramMap.get('tournamentId')
          if( tournamentId!=null ){
            thiz.tournamentId = tournamentId
            thiz.update()
          }
        }
      })
  }
  update(){
    this.firebaseService.getDocument( TournamentCollection.collectionName, this.tournamentId).then( (data)=>{
      this.tournament = data 
    },
    reason =>{
      alert("Error updating category")
    })    
  }

  onSubmit(){
    let label = this.form.controls.label.value
    let description = this.form.controls.description.value
    let minGrade = this.form.controls.minGrade.value
    if( this.tournament && label && minGrade){
      let medal:Medal={
        id: uuidv4(),
        label: label,
        description: description ? description : "",
        minGrade: Number(minGrade)
      }
      this.tournament.medals.push( medal )
      let obj:Tournament = {
        medals:this.tournament.medals
      }        
     
      this.firebaseService.updateDocument( TournamentCollection.collectionName, this.tournamentId, obj).then( ()=>{
        console.log("premio ha sido adicionada")
        this.router.navigate(['../'], { relativeTo: this.activatedRoute })

      },
      reason =>{
        alert("Error adicionando premio")
      })       
    }
    
  }


}

