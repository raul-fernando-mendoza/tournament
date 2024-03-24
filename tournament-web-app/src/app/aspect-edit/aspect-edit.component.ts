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
  selector: 'app-aspect-edit',
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
  templateUrl: './aspect-edit.component.html',
  styleUrl: './aspect-edit.component.css'
})
export class AspectEditComponent {

  tournamentId!:string
  evaluationId!:string
  aspectId!:string

  evaluation:Evaluation | null = null
  tournament:TournamentObj | null = null
  aspect:Aspect | null = null

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
          let aspectId = paramMap.get("aspectId")          
          if( tournamentId!=null && evaluationId && aspectId){
            thiz.tournamentId = tournamentId
            thiz.evaluationId = evaluationId
            thiz.aspectId = aspectId
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
        let aspect = this.evaluation.aspects.find( e => e.id == this.aspectId)
        if( aspect ){
          this.aspect = aspect
          this.form.controls.label.setValue( aspect.label )
          this.form.controls.description.setValue( aspect.description )          
        }
      }
    },
    reason =>{
      alert("Error updating category")
    })    
  }

  onSubmit(){
    let label = this.form.controls.label.value
    let description = this.form.controls.description.value
    if( this.tournament && this.evaluation && this.aspect && label ){
      this.aspect.label = label
      this.aspect.description = description

      let obj:Tournament = {
        evaluations:this.tournament.evaluations
      }        
     
      this.firebaseService.updateDocument( TournamentCollection.collectionName, this.tournamentId, obj).then( ()=>{
        console.log("aspect ha sido modificado")
        this.router.navigate(['../../'], { relativeTo: this.activatedRoute })

      },
      reason =>{
        alert("Error editando aspect")
      })       
    }
    
  }
  onDelete(){
    if( !confirm("Esta seguro de querer borrar:" +  this.aspect!.label) ){
      return
    }          
    let index = this.evaluation!.aspects.findIndex( e => e.id == this.aspectId)
    if( index >= 0 ){
      this.evaluation!.aspects.splice( index, 1)
      let obj:Tournament = {
        evaluations:this.tournament!.evaluations
      }        
     
      this.firebaseService.updateDocument( TournamentCollection.collectionName, this.tournamentId, obj).then( ()=>{
        console.log("aspecto ha sido removido")
        this.router.navigate(['../../'], { relativeTo: this.activatedRoute })

      },
      reason =>{
        alert("Error modificando evaluation")
      })       
    }    

  }

}

