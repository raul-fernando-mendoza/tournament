import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FirebaseService } from '../firebase.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Medal, Tournament, TournamentCollection, TournamentObj } from '../types';
import { v4 as uuidv4, v4 } from 'uuid';

@Component({
  selector: 'app-medals-list',
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
  templateUrl: './medals-list.component.html',
  styleUrl: './medals-list.component.css',

})
export class MedalsListComponent {
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
    medals: new FormArray([]),
  });  

  getGroups(): FormGroup[] {
    let formArray:FormArray  = this.form.get('medals') as FormArray
    let formGroups:FormGroup[] = (formArray.controls) as FormGroup[]
    return formGroups
  }

  update(){
    this.firebaseService.getDocument( TournamentCollection.collectionName, this.tournamentId).then( (data)=>{
      this.tournament = data 
      let medals = this.form.get('medals') as FormArray
      medals.clear()
      if( medals ){
        this.tournament.medals?.map( medal =>
          medals.push(
            this.fb.group({
              id:[medal.id,Validators.required],
              label:[medal.label,Validators.required],
              minGrade:[medal.minGrade,Validators.required]
            })
          )
        )
      }      
    },
    reason =>{
      alert("Error updating medals")
    })    
  }

  onAdd() {
    let medals = this.form.get('medals') as FormArray
    if( medals ){
      medals.push(
        this.fb.group({
          id:[null],
          label:['',Validators.required],
          minGrade:['',Validators.required]
        })
      );
    }
    this.isAdding = true
  }
  onSubmit(){
    let FGs = this.getGroups()
    let categoryGrp = FGs[ FGs.length -1 ]
    let id = categoryGrp?.controls["id"].value
    let label = categoryGrp?.controls["label"].value.trim()
    let minGrade = categoryGrp?.controls["minGrade"].value
    let medal:Medal = { 
      id:uuidv4(),
        label: label,
        minGrade: Number(minGrade)
      }
    this.tournament.medals.push( medal )
    this.tournament.medals.sort( (a,b)=>{
      return a.minGrade >= b.minGrade ? -1 : 1
    }) 
    let obj:Tournament = {
      medals:this.tournament.medals
    }
    this.firebaseService.updateDocument( TournamentCollection.collectionName, this.tournamentId, obj).then( ()=>{
      console.log("medals list updated")
      this.isAdding = false
      this.update()
    },
    reason =>{
      alert("Error updating medals")
    })
  }

  onSave(id:string) {
    console.log("on save")
    if( id ){

      let FGs = this.getGroups()
      let idx = FGs.findIndex( FG => FG.controls["id"].value == id )
      if( idx >= 0 ){
        let categoryGrp = FGs[idx]
        let label =  categoryGrp?.controls["label"].value.trim()
        let minGrade =  Number(categoryGrp?.controls["minGrade"].value)
      
        this.tournament.medals[ idx ].label = label
        this.tournament.medals[ idx ].minGrade = minGrade

        this.tournament.medals.sort( (a,b)=>{
          return a.minGrade >= b.minGrade ? -1 : 1
        }) 

        let obj:Tournament = {
          medals:this.tournament.medals
        }        
 
        this.firebaseService.updateDocument( TournamentCollection.collectionName, this.tournamentId, obj).then( ()=>{
          console.log("medals list updated")
          this.update()
        },
        reason =>{
          alert("Error updating medals")
        })
      }
    }
  }

  onDelete(id:string) {

    let idx:number = this.tournament.medals.findIndex( c => c.id == id)

    if( idx >= 0){
      this.tournament.medals.splice(idx,1)
      let obj:Tournament = {
        medals:[] = this.tournament.medals
      }
  
      this.firebaseService.updateDocument( TournamentCollection.collectionName, this.tournamentId, obj).then( ()=>{
        console.log("medals list updated")
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
