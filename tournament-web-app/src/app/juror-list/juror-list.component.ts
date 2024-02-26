import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { CommonModule, ViewportScroller } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FirebaseService } from '../firebase.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Dictionary, Juror, Tournament, TournamentCollection, TournamentObj } from '../types';
import { v4 as uuidv4, v4 } from 'uuid';
import { MatCardModule } from '@angular/material/card';

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
    ,RouterModule
    ,MatCardModule    
  ],
  templateUrl: './juror-list.component.html',
  styleUrl: './juror-list.component.css',

})
export class JurorListComponent {
  @ViewChild("edited", {static: false}) childComponentRef: ElementRef | null = null;

  tournamentId:string | null = null
  tournament!:TournamentObj


  isAdding = false
  editingId:string | null = null  

  constructor( public firebaseService:FirebaseService 
    ,private fb:FormBuilder
    ,private activatedRoute: ActivatedRoute 
    ,private viewportScroller: ViewportScroller          
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
    this.isAdding = false
    this.editingId = null      
    this.firebaseService.getDocument( TournamentCollection.collectionName, this.tournamentId).then( (data)=>{
      this.tournament = data 
      let jurors = this.form.get('jurors') as FormArray
      jurors.clear()
      if( jurors ){
        let jurorsArray = Object.values(this.tournament.jurors)
        jurorsArray.map( juror =>
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
    this.isAdding =true
    this.editingId = null       
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
    this.isAdding =false
    this.editingId = null   

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
    this.tournament.jurors[email] =  juror 
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
    this.isAdding =false
    this.editingId = null   

    console.log("on save")
    if( id ){

      let FGs = this.getGroups()
      let fgIdx = FGs.findIndex( FG => FG.controls["id"].value == id )
      
      //new values
      let grp = FGs[fgIdx]
      let label =  grp.controls["label"].value.trim()
      let email =  grp.controls["email"].value.trim()

      let newJurors:Dictionary<Juror> = {}
      if( fgIdx >= 0 ){

        let oldValues:Array<Juror> = Object.values(this.tournament.jurors)
        let oldIdx = oldValues.findIndex( e=>e.id = id)
        if( oldIdx >= 0){
          let oldJuror:Juror = oldValues[oldIdx]
          if( oldJuror.email! != email){
            //erase the old value
            Object.values(this.tournament.jurors).map( c => {
              if( c.id != id ){
                newJurors[c.email!] = c
              }
            })          
            //now add the new value
            let juror:Juror = { 
              id:id,
              label: label,
              email: email
            }            
            newJurors[email] = juror           
          }
          else{ //use the old email
            newJurors = this.tournament.jurors
            newJurors[email].label = label
          }
        }

      }
      let obj:Tournament = {
        jurors:newJurors
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

  onDelete(id:string) {
    this.isAdding =false
    this.editingId = null 

    let jurorArray = Object.values( this.tournament.jurors )
    
    let idx:number = jurorArray.findIndex( c => c.id == id)



    if( idx >= 0){
      let newJurors:Dictionary<Juror> = {}
      Object.values(this.tournament.jurors).map( c => {
        if( c.id != id ){
          newJurors[c.email!] = c
        }
      })
      let obj:Tournament = {
        jurors:newJurors
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
    this.isAdding =false
    this.editingId = null 

    let FGs = this.getGroups()
    FGs.splice( FGs.length-1,1)
    this.isAdding =false
  }  

  onCancelEdit(){
    this.isAdding = false
    this.editingId = null       
    this.update()
  }
  onEdit(id:string){
    this.isAdding = false
    this.editingId = id
    this.waitForElement("edited")
  }

  waitForElement(selector:string) {
    let thiz = this
    let observer = new MutationObserver(mutations => {
      mutations.forEach(function(mutation) {
        if( thiz.childComponentRef ){
          observer.disconnect();
          thiz.scroll(selector)
        }
      });
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }


  scroll(selector:string) {
    this.viewportScroller.scrollToAnchor(selector)
  }


}
