import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FirebaseService } from '../firebase.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Aspect, Evaluation, Tournament, TournamentCollection, TournamentObj } from '../types';
import { v4 as uuidv4, v4 } from 'uuid';

@Component({
  selector: 'app-aspect-list',
  standalone: true,
  imports: [
    CommonModule
    ,MatIconModule
    ,MatButtonModule      
    ,FormsModule
    ,ReactiveFormsModule
    ,MatFormFieldModule
    ,MatInputModule
    ,RouterModule],
  templateUrl: './aspect-list.component.html',
  styleUrl: './aspect-list.component.css',

})
export class AspectListComponent {
  tournamentId!:string
  evaluationId!:string 
  tournament!:TournamentObj
  evaluation!:Evaluation

  isAdding = false

  constructor( public firebaseService:FirebaseService 
    ,private fb:FormBuilder
    ,private activatedRoute: ActivatedRoute    
  ){
    var thiz = this
    this.activatedRoute.paramMap.subscribe({
        next(paramMap){
          let tournamentId = paramMap.get('tournamentId')
          let evaluationId = paramMap.get("evaluationId")
          if(tournamentId && evaluationId){
            thiz.tournamentId = tournamentId
            thiz.evaluationId = evaluationId
            thiz.update()
          }
          
        }
      })
  }

  formArray= new FormArray([])

  getGroups(): FormGroup[] {
    let formGroups:FormGroup[] = (this.formArray.controls) as FormGroup[]
    return formGroups
  }

  update(){
    this.firebaseService.getDocument( TournamentCollection.collectionName, this.tournamentId).then( (data)=>{
      this.tournament = data 
      this.formArray.clear()
      let idx = this.tournament.evaluations.findIndex( e => e.id == this.evaluationId)
      this.evaluation = this.tournament.evaluations[idx]
      this.evaluation.aspects.map( aspect =>{
        this.getGroups().push(
          this.fb.group({
            id:[aspect.id,Validators.required],
            label:[aspect.label,Validators.required],
            description:[aspect.description,Validators.required]
          })
        )
      })

    },
    reason =>{
      alert("Error updating aspects")
    })    
  }

  onAdd() {
    this.getGroups().push(
      this.fb.group({
        id:[null],
        label:['',Validators.required],
        description:['',Validators.required]
      })
    );
    this.isAdding = true
  }
  onSubmit(){
    let FGs = this.getGroups()
    let lastGrp = FGs[ FGs.length -1 ]
    let label = lastGrp.controls["label"].value.trim()
    let description = lastGrp.controls["description"].value.trim()
    let aspect:Aspect = { 
        id:uuidv4(),
        label: label,
        description: description
      }
    this.evaluation.aspects.push( aspect )

    let obj:Tournament = {
      evaluations:this.tournament.evaluations
    }
    this.firebaseService.updateDocument( TournamentCollection.collectionName, this.tournamentId, obj).then( ()=>{
      console.log("aspects list updated")
      this.isAdding = false
      this.update()
    },
    reason =>{
      alert("Error updating aspects:" + reason)
    })
  }

  onSave(id:string) {
    console.log("on save")
    if( id ){

      let FGs = this.getGroups()
      let idx = FGs.findIndex( FG => FG.controls["id"].value == id )
      if( idx >= 0 ){
        let grp = FGs[idx]
        let label =  grp.controls["label"].value.trim()
        let description =  grp.controls["description"].value.trim()
      
        this.evaluation.aspects[ idx ].label = label
        this.evaluation.aspects[ idx ].description = description

        let obj:Tournament = {
          evaluations:this.tournament.evaluations
        }        
 
        this.firebaseService.updateDocument( TournamentCollection.collectionName, this.tournamentId, obj).then( ()=>{
          console.log("aspects list updated")
          this.update()
        },
        reason =>{
          alert("Error updating aspects" + reason)
        })
      }
    }
  }

  onDelete(id:string) {

    let idx:number = this.evaluation.aspects.findIndex( c => c.id == id)

    if( idx >= 0){
      this.evaluation.aspects.splice(idx,1)
      let obj:Tournament = {
        evaluations:[] = this.tournament.evaluations
      }
  
      this.firebaseService.updateDocument( TournamentCollection.collectionName, this.tournamentId, obj).then( ()=>{
        console.log("aspects list updated")
        this.update()
      },
      reason =>{
        alert("Error updating categories")
      })
    }
  }
  onCancelAdd(){
    let FGs = this.getGroups()
    FGs.splice( FGs.length-1,1)
    this.isAdding =false
  }  

  onChange( id:string ){
    let FGs = this.getGroups()
    FGs.map( fg =>{
      if( fg.controls["id"].value != id){
        fg.disable()
      } 
    })
    return true
  }

  onCancelEdit(){
    this.update()
  }  

}
