import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { CommonModule, ViewportScroller } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FirebaseService } from '../firebase.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Evaluation, Tournament, TournamentCollection, TournamentObj } from '../types';
import { v4 as uuidv4, v4 } from 'uuid';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { QuillModule } from 'ngx-quill'
import {MatGridListModule} from '@angular/material/grid-list';

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
    ,QuillModule
    ,MatGridListModule
  ],
  templateUrl: './evaluation-list.component.html',
  styleUrl: './evaluation-list.component.css',

})
export class EvaluationListComponent {
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
    evaluations: new FormArray([]),
  });  

  getEvaluationGroups(): FormGroup[] {
    let formArray:FormArray  = this.form.get('evaluations') as FormArray
    let formGroups:FormGroup[] = (formArray.controls) as FormGroup[]
    return formGroups
  }

  update(){
    this.isAdding = false
    this.editingId = null    
    this.firebaseService.getDocument( TournamentCollection.collectionName, this.tournamentId).then( (data)=>{
      this.tournament = data 
      let FA = this.form.get('evaluations') as FormArray
      FA.clear()
      if( FA ){
        this.tournament.evaluations?.map( evaluation =>
          FA.push(
            this.fb.group({
              id:[evaluation.id],
              label:[evaluation.label,Validators.required],
              description:[evaluation.description,Validators.required],
              aspects:[evaluation.aspects]
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
    this.isAdding =true
    this.editingId = null      
    let evaluation = this.form.get('evaluations') as FormArray
    if( evaluation ){
      evaluation.push(
        this.fb.group({
          id:[null],
          label:['',Validators.required],
          description:['',Validators.required]
        })
      );
      this.isAdding = true
    }
  }
  onSubmit(){
    this.isAdding =false
    this.editingId = null   

    let evaluationFGs = this.getEvaluationGroups()
    let evaluationGrp = evaluationFGs[ evaluationFGs.length -1 ]
    let id = evaluationGrp?.controls["id"].value
    let label = evaluationGrp?.controls["label"].value
    let description = evaluationGrp?.controls["description"].value
    let evaluation:Evaluation = {
      id: uuidv4(),
      label: label,
      description: description,
      aspects: []
    }
    this.tournament.evaluations.push( evaluation )
    let obj:Tournament = {
      evaluations:this.tournament.evaluations
    }        
   
    this.firebaseService.updateDocument( TournamentCollection.collectionName, this.tournamentId, obj).then( ()=>{
      console.log("evaluation list updated")
      this.isAdding = false
      this.update()
    },
    reason =>{
      alert("Error updating evaluation list")
    })    
  }

  onSave(id:string) {
    this.isAdding =false
    this.editingId = null       
    if( id ){

      let FGs = this.getEvaluationGroups()
      let idx = FGs.findIndex( FG => FG.controls["id"].value == id )
      if( idx >= 0 ){
        let evaluationGrp = FGs[idx]
        let label =  evaluationGrp?.controls["label"].value.trim()
        let description =  evaluationGrp?.controls["description"].value.trim()

        this.tournament.evaluations[ idx ].label = label
        this.tournament.evaluations[ idx ].description = description
        let obj:Tournament = {
          evaluations:this.tournament.evaluations
        }        
       
        this.firebaseService.updateDocument( TournamentCollection.collectionName, this.tournamentId, obj).then( ()=>{
          console.log("evaluation list updated")
          this.update()
        },
        reason =>{
          alert("Error updating evaluation:" + reason)
        })
      }
    }
  }

  onDelete(id:string) {
    this.isAdding =false
    this.editingId = null 

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
        alert("Error updating evaluations")
      })
    }
  }
  onCancelAdd(){
    this.isAdding =false
    this.editingId = null      
    
    let FGs = this.getEvaluationGroups()
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
