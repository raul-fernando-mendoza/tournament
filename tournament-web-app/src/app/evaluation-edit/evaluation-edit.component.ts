import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { QuillModule } from 'ngx-quill';
import { FirebaseService } from '../firebase.service';
import { Evaluation, Tournament, TournamentCollection, TournamentObj } from '../types';

@Component({
  selector: 'app-evaluation-edit',
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
  templateUrl: './evaluation-edit.component.html',
  styleUrl: './evaluation-edit.component.css'
})
export class EvaluationEditComponent {
  tournamentId!:string
  evaluationId!:string

  tournament:TournamentObj | null = null
  evaluation:Evaluation | null = null 

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
          let evaluationId = paramMap.get('evaluationId')
          if( tournamentId!=null && evaluationId ){
            thiz.tournamentId = tournamentId
            thiz.evaluationId = evaluationId
            thiz.update()
          }
        }
      })
  }
  update(){
    this.firebaseService.getDocument( TournamentCollection.collectionName, this.tournamentId).then( (data)=>{
      
      this.tournament = data as TournamentObj
      
      let evaluation = this.tournament.evaluations.find( e => e.id == this.evaluationId)
      if( evaluation ){
        this.evaluation = evaluation
        this.form.controls.label.setValue( evaluation.label )
        this.form.controls.description.setValue( evaluation.description )
      }
    },
    reason =>{
      alert("Error leyendo evaluation")
    })    
  }

  onSubmit(){
    let label = this.form.controls.label.value
    let description = this.form.controls.description.value
    if( this.tournament && this.evaluation && label ){
      this.evaluation.label = label
      this.evaluation.description = description ? description : ""
      let obj:Tournament = {
        evaluations:this.tournament.evaluations
      }        
     
      this.firebaseService.updateDocument( TournamentCollection.collectionName, this.tournamentId, obj).then( ()=>{
        console.log("evaluation ha sido modificada")
        if( this.evaluation!.aspects.length > 0){
          this.router.navigate(['../../'], { relativeTo: this.activatedRoute })
        }
        else{
          alert( "Por favor adicione por lo menos un aspecto a calificar" )
        }

      },
      reason =>{
        alert("Error modificando evaluation")
      })       
    }
    
  }
  onDelete(){
    if( !confirm("Esta seguro de querer borrar:" +  this.evaluation!.label) ){
      return
    }          
    let index = this.tournament!.evaluations.findIndex( e => e.id == this.evaluationId)
    if( index >= 0 ){
      this.tournament!.evaluations.splice( index, 1)
      let obj:Tournament = {
        evaluations:this.tournament!.evaluations
      }        
     
      this.firebaseService.updateDocument( TournamentCollection.collectionName, this.tournamentId, obj).then( ()=>{
        console.log("evaluation ha sido modificada")
        this.router.navigate(['../../'], { relativeTo: this.activatedRoute })

      },
      reason =>{
        alert("Error modificando evaluation")
      })       
    }    

  }
}
