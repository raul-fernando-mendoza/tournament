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
import { Aspect, Evaluation, Tournament, TournamentCollection, TournamentObj } from '../types';
import { v4 as uuidv4, v4 } from 'uuid';

@Component({
  selector: 'app-aspect-new',
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
  ],
  templateUrl: './aspect-new.component.html',
  styleUrl: './aspect-new.component.css'
})
export class AspectNewComponent {

  tournamentId!:string
  evaluationId!:string
  evaluation:Evaluation | null = null

  tournament:TournamentObj | null = null

  form = this.fb.group({
    label:["",Validators.required],
    description:[""]
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
          let evaluationId = paramMap.get("evaluationId")
          if( tournamentId!=null && evaluationId){
            thiz.tournamentId = tournamentId
            thiz.evaluationId = evaluationId
            thiz.update()
          }
        }
      })
  }
  update(){
    this.firebaseService.getDocument( TournamentCollection.collectionName, this.tournamentId).then( (data)=>{
      this.tournament = data 
      let evaluation = this.tournament!.evaluations.find( e => e.id == this.evaluationId)
      if( evaluation ){
        this.evaluation = evaluation
      }
    },
    reason =>{
      alert("Error updating category")
    })    
  }

  onSubmit(){
    let label = this.form.controls.label.value
    let description = this.form.controls.description.value
    if( this.tournament && this.evaluation && label ){
      let aspect:Aspect={
        id: uuidv4(),
        label: label,
        description: description ? description : ""
      }
      this.evaluation.aspects.push( aspect )
      let obj:Tournament = {
        evaluations:this.tournament.evaluations
      }        
     
      this.firebaseService.updateDocument( TournamentCollection.collectionName, this.tournamentId, obj).then( ()=>{
        console.log("aspect ha sido adicionada")
        this.router.navigate(['../'], { relativeTo: this.activatedRoute })

      },
      reason =>{
        alert("Error adicionando aspect")
      })       
    }
    
  }


}
