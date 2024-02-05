import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FirebaseService } from '../firebase.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Performance, PerformanceCollection, PerformanceObj, Tournament, TournamentCollection, TournamentObj } from '../types';
import { v4 as uuidv4, v4 } from 'uuid';
import {MatSelectModule} from '@angular/material/select';
import {MatDividerModule} from '@angular/material/divider';
import {MatCardModule} from '@angular/material/card';

@Component({
  selector: 'app-performance-list',
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
    ,MatSelectModule
    ,MatDividerModule
    ,MatCardModule
  ],
  templateUrl: './performance-list.component.html',
  styleUrl: './performance-list.component.css',

})
export class PerformanceListComponent {
  id!:string
  tournament!:TournamentObj

  isAdding = false

  constructor( public firebaseService:FirebaseService 
    ,private fb:FormBuilder
    ,private activatedRoute: ActivatedRoute    
  ){
    var thiz = this
    this.activatedRoute.paramMap.subscribe({
        next(paramMap){
          let tournamentId = paramMap.get('tournamentId')
          if( tournamentId!=null ){
            thiz.id = tournamentId
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
    this.firebaseService.getDocument( TournamentCollection.collectionName, this.id).then( (data)=>{
      this.tournament = data 
     
    },
    reason =>{
      alert("Error reading tournament:" + reason)
    }).then( ()=>{
      this.readPerformances()
    })    
  }

  readPerformances(){
    this.formArray.clear()
    this.firebaseService.getDocuments( [TournamentCollection.collectionName,this.id, PerformanceCollection.collectionName].join("/")).then( set =>{
      set.map( e =>{
        let p = e.data() as PerformanceObj
        let g = this.fb.group({
          id:[e.id],
          label:[p.label],
          categoryId:[p.categoryId,Validators.required],
          fullname:[p.fullname,Validators.required],
          email:[p.email,Validators.required],
        })        
        this.getGroups().push(g)
      })
      this.getGroups().sort( (a,b) => a.controls["label"].value > b.controls["label"].value ? 1 : -1)
    })
  }

  onAdd() {
    this.getGroups().push(
      this.fb.group({
        id:[null],
        label:[""],
        categoryId:["",Validators.required],
        fullname:["",Validators.required],
        email:["",Validators.required]
      })
    );
    this.isAdding = true
  }
  onSubmit(){
    let FGs = this.getGroups()
    
    let lastGrp = FGs[ FGs.length -1 ]
    let label = lastGrp.controls["label"].value
    let categoryId = lastGrp.controls["categoryId"].value
    let fullname = lastGrp.controls["fullname"].value
    let email = lastGrp.controls["email"].value

    let obj:PerformanceObj = {
      categoryId: categoryId,
      fullname: fullname,
      email:email,
      label: label,
      isAccepted: false,
      grade: 0,
      overwrittenGrade: null,
      isReleased: false
    }
    let id=uuidv4()
    this.firebaseService.setDocument( [TournamentCollection.collectionName,this.id,PerformanceCollection.collectionName].join("/"), id, obj).then( ()=>{
      console.log("performances added")
      this.isAdding = false
      this.update()
    },
    reason =>{
      alert("Error updating performances:" + reason)
    })
  }

  onSave(id:string) {
    let FGs = this.getGroups()
    let idx = FGs.findIndex( FG => FG.controls["id"].value == id )
    if( idx >= 0 ){
      let grp = FGs[idx]
      let id = grp.controls["id"].value
      let label =  grp.controls["label"].value.trim()
      let categoryId =  grp.controls["categoryId"].value.trim()
      let fullname =  grp.controls["fullname"].value.trim()
      let email = grp.controls["email"].value.trim()
    
      let obj:Performance = {
        label:label,
        categoryId:categoryId,
        fullname:fullname,
        email:email
      }        

      this.firebaseService.updateDocument( [TournamentCollection.collectionName,this.id,PerformanceCollection.collectionName].join("/"), id, obj).then( ()=>{
        console.log("performances list updated")
        this.update()
      },
      reason =>{
        alert("Error updating performances" + reason)
      })
    }
  }

  onDelete(id:string) {
    let FGs = this.getGroups()
    let idx = FGs.findIndex( FG => FG.controls["id"].value == id )

    if( idx >= 0 ){
      this.firebaseService.deleteDocument( [TournamentCollection.collectionName,this.id,PerformanceCollection.collectionName].join("/"), id).then( ()=>{
        console.log("performances list updated")
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

  onAddToProgram(id:string) {
    let FGs = this.getGroups()
    let idx = FGs.findIndex( FG => FG.controls["id"].value == id )

    if( idx >= 0 ){  
      this.tournament.program.push( id )
      let obj:Tournament = {
        program:this.tournament.program
      }
      this.firebaseService.updateDocument( TournamentCollection.collectionName, this.id, obj).then( ()=>{
        this.update()
      },
      reason =>{
        alert("Error guardando programa:" + reason )
      })  
    }  
  }

  onRemoveFromProgram(id:string) {
    let FGs = this.getGroups()
    let idx = FGs.findIndex( FG => FG.controls["id"].value == id )

    if( idx >= 0 ){  
      this.tournament.program.splice( idx, 1 )
      let obj:Tournament = {
        program:this.tournament.program
      }
      this.firebaseService.updateDocument( TournamentCollection.collectionName, this.id, obj).then( ()=>{
        this.update()
      },
      reason =>{
        alert("Error guardando programa:" + reason )
      })  
    }  
  }  

  isInProgram( id:string ){
    let idx = this.tournament.program.findIndex( e=> e == id)
    if( idx >= 0 ){
      return true
    }
    return false
  }
}
