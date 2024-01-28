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

  isAdding = false
  getMedalsGroups(): FormGroup[] {
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
              minValue:[medal.minGrade,Validators.required]
            })
          )
        )
      }      
    },
    reason =>{
      alert("Error updating medals")
    })    
  }

  addMedal() {
    let medals = this.form.get('medals') as FormArray
    if( medals ){
      medals.push(
        this.fb.group({
          id:[null,Validators.required],
          label:['',Validators.required],
          minValue:['',Validators.required]
        })
      );
    }
    this.isAdding = true
    
  }

  onChange(id:string){
    let obj:Tournament = {
      medals:[] = []
    }
    for( let i = 0; i<this.getMedalsGroups().length;i++){
      let medalGrp = this.getMedalsGroups().at(i)
      let id= medalGrp?.controls["id"].value
      let label = medalGrp?.controls["label"].value
      let minValue = medalGrp?.controls["minValue"].value
      let medal:Medal = {
        id:id,
        label: label,
        minGrade: Number(minValue)
      }
      obj.medals![i] = medal
    }
    this.firebaseService.updateDocument( TournamentCollection.collectionName, this.tournamentId, obj).then( ()=>{
      console.log("medals list updated")
    },
    reason =>{
      alert("Error updating medals")
    })
      
 
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
        alert("Error deleting medal")
      })
    }
  }  

}
