import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormArray, FormBuilder,  FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FirebaseService } from '../firebase.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Evaluation, Tournament, TournamentCollection, TournamentObj } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { MatCardModule } from '@angular/material/card';

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
export class EvaluationListComponent {
  tournamentId:string | null = null
  tournament!:TournamentObj

  isAdding = false

  constructor( public firebaseService:FirebaseService 
    ,private fb:FormBuilder
    ,private activatedRoute: ActivatedRoute    
    ,private router: Router
  ){
    var thiz = this
    this.activatedRoute.paramMap.subscribe({
        next(paramMap){
          thiz.tournamentId = null
          if( paramMap.get('tournamentId')!=null ){
            thiz.tournamentId = paramMap.get('tournamentId')
            thiz.update()
          }
        }
      })
  }

  form = new FormGroup({
    evaluations: new FormArray([]),
  });  

  getGroups(): FormGroup[] {
    let formArray:FormArray  = this.form.get('evaluations') as FormArray
    let formGroups:FormGroup[] = (formArray.controls) as FormGroup[]
    return formGroups
  }

  update(){
    this.firebaseService.getDocument( TournamentCollection.collectionName, this.tournamentId).then( (data)=>{
      this.tournament = data 
      let fa = this.form.get('evaluations') as FormArray
      fa.clear()
      if( fa ){
        this.tournament.evaluations?.map( evaluation =>
          fa.push(
            this.fb.group({
              id:[evaluation.id],
              label:[evaluation.label,Validators.required],
              description:[evaluation.description]
            })
          )
        )
      }      
    },
    reason =>{
      alert("Error updating evaluations")
    })    
  }

  onAdd() {
    let fa = this.form.get('evaluations') as FormArray
    if( fa ){
      fa.push(
        this.fb.group({
          id:[null],
          label:['',Validators.required],
          description:['',Validators.required]
        })
      );
    }
    this.isAdding = true
  }
  onSubmit(){
    let FGs = this.getGroups()
    let grp = FGs[ FGs.length -1 ]
    let label = grp?.controls["label"].value.trim()
    let description = grp?.controls["description"].value
    let evaluation:Evaluation = {
      id: uuidv4(),
      label: label,
      description: description,
      aspect: []
    }
    this.tournament.evaluations.push( evaluation )
    this.tournament.evaluations.sort( (a,b)=>{
      return a.label >= b.label ? 1 : -1
    }) 
    let obj:Tournament = {
      evaluations:this.tournament.evaluations
    }
    this.firebaseService.updateDocument( TournamentCollection.collectionName, this.tournamentId, obj).then( ()=>{
      console.log("evaluations list updated")
      this.isAdding = false
      this.update()
    },
    reason =>{
      alert("Error updating evaluations")
    })
  }

  onSave(id:string) {
    console.log("on save")
    if( id ){

      let FGs = this.getGroups()
      let idx = FGs.findIndex( FG => FG.controls["id"].value == id )
      if( idx >= 0 ){
        let grp = FGs[idx]
        let label =  grp?.controls["label"].value.trim()
        let description =  grp?.controls["description"].value
      
        this.tournament.evaluations[ idx ].label = label
        this.tournament.evaluations[ idx ].description = description

        this.tournament.evaluations.sort( (a,b)=>{
          return a.label >= b.label ? 1 : -1
        }) 

        let obj:Tournament = {
          evaluations:this.tournament.evaluations
        }        
 
        this.firebaseService.updateDocument( TournamentCollection.collectionName, this.tournamentId, obj).then( ()=>{
          console.log("evaluations list updated")
          this.update()
        },
        reason =>{
          alert("Error updating evaluations")
        })
      }
    }
  }

  onDelete(id:string) {

    let idx:number = this.tournament.evaluations.findIndex( c => c.id == id)

    if( idx >= 0){
      this.tournament.evaluations.splice(idx,1)
      let obj:Tournament = {
        evaluations:[] = this.tournament.evaluations
      }
  
      this.firebaseService.updateDocument( TournamentCollection.collectionName, this.tournamentId, obj).then( ()=>{
        console.log("evaluations list updated")
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
