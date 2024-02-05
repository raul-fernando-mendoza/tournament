import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FirebaseService } from '../firebase.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Juror, Tournament, TournamentCollection, TournamentObj } from '../types';
import { v4 as uuidv4, v4 } from 'uuid';

@Component({
  selector: 'app-juror-list',
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
  templateUrl: './juror-list.component.html',
  styleUrl: './juror-list.component.css',

})
export class JurorListComponent {
  tournamentId:string | null = null
  tournament!:TournamentObj

  isAdding = false

  constructor( public firebaseService:FirebaseService 
    ,private fb:FormBuilder
    ,private activatedRoute: ActivatedRoute    
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
    jurors: new FormArray([]),
  });  

  getGroups(): FormGroup[] {
    let formArray:FormArray  = this.form.get('jurors') as FormArray
    let formGroups:FormGroup[] = (formArray.controls) as FormGroup[]
    return formGroups
  }

  update(){
    this.firebaseService.getDocument( TournamentCollection.collectionName, this.tournamentId).then( (data)=>{
      this.tournament = data 
      let jurors = this.form.get('jurors') as FormArray
      jurors.clear()
      if( jurors ){
        this.tournament.jurors.map( juror =>
          jurors.push(
            this.fb.group({
              id:[juror.id,Validators.required],
              label:[juror.label,Validators.required],
              email:[juror.email,Validators.required]
            })
          )
        )
      }      
    },
    reason =>{
      alert("Error updating jurors")
    })    
  }

  onAdd() {
    let jurors = this.form.get('jurors') as FormArray
    if( jurors ){
      jurors.push(
        this.fb.group({
          id:[null],
          label:['',Validators.required],
          email:['',Validators.required]
        })
      );
    }
    this.isAdding = true
  }
  onSubmit(){
    let FGs = this.getGroups()
    let lastGrp = FGs[ FGs.length -1 ]
    let id = lastGrp.controls["id"].value
    let label = lastGrp.controls["label"].value.trim()
    let email = lastGrp.controls["email"].value.trim()
    let juror:Juror = { 
        id:uuidv4(),
        label: label,
        email: email
      }
    this.tournament.jurors.push( juror )
    this.tournament.jurors.sort( (a,b)=>{
      return a.label >= b.label ? -1 : 1
    }) 
    let obj:Tournament = {
      jurors:this.tournament.jurors
    }
    this.firebaseService.updateDocument( TournamentCollection.collectionName, this.tournamentId, obj).then( ()=>{
      console.log("jurors list updated")
      this.isAdding = false
      this.update()
    },
    reason =>{
      alert("Error updating jurors:" + reason)
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
        let email =  grp.controls["email"].value.trim()
      
        this.tournament.jurors[ idx ].label = label
        this.tournament.jurors[ idx ].email = email

        this.tournament.jurors.sort( (a,b)=>{
          return a.label >= b.label ? -1 : 1
        }) 

        let obj:Tournament = {
          jurors:this.tournament.jurors
        }        
 
        this.firebaseService.updateDocument( TournamentCollection.collectionName, this.tournamentId, obj).then( ()=>{
          console.log("jurors list updated")
          this.update()
        },
        reason =>{
          alert("Error updating jurors" + reason)
        })
      }
    }
  }

  onDelete(id:string) {

    let idx:number = this.tournament.jurors.findIndex( c => c.id == id)

    if( idx >= 0){
      this.tournament.jurors.splice(idx,1)
      let obj:Tournament = {
        jurors:[] = this.tournament.jurors
      }
  
      this.firebaseService.updateDocument( TournamentCollection.collectionName, this.tournamentId, obj).then( ()=>{
        console.log("jurors list updated")
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
