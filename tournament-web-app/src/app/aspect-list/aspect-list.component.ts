import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { CommonModule, ViewportScroller } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Aspect, Evaluation, Tournament, TournamentCollection, TournamentObj } from '../types';
import { FirebaseService } from '../firebase.service';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { v4 as uuidv4, v4 } from 'uuid';
import { MatCardModule } from '@angular/material/card';
import { QuillModule } from 'ngx-quill'
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-aspect-list',
  standalone: true,
  imports: [
    CommonModule
    ,MatIconModule
    ,MatButtonModule      
    ,RouterModule
    ,MatCardModule
    ,QuillModule
    ,FormsModule
    ,ReactiveFormsModule
    ,MatFormFieldModule
    ,MatInputModule    
  ],
  templateUrl: './aspect-list.component.html',
  styleUrl: './aspect-list.component.css',

})
export class AspectListComponent{
  @Input() tournamentId!:string
  @Input() tournament!:TournamentObj
  @Input() evaluationId!:string 
  @Input() evaluation!:Evaluation

  @ViewChild("edited", {static: false}) childComponentRef: ElementRef | null = null;
  
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
          let tournamentId = paramMap.get('tournamentId')
          let evaluationId = paramMap.get('evaluationId')
          if( tournamentId!=null && evaluationId!=null){
            thiz.tournamentId = tournamentId
            thiz.evaluationId = evaluationId
            thiz.update()
          }
        }
      })
  }

  form = new FormGroup({
    aspects: new FormArray([]),
  });  

  getAspectGroups(): FormGroup[] {
    let formArray:FormArray  = this.form.get('aspects') as FormArray
    let formGroups:FormGroup[] = (formArray.controls) as FormGroup[]
    return formGroups
  }

  update(){
    this.isAdding = false
    this.editingId = null    

    this.firebaseService.getDocument( TournamentCollection.collectionName, this.tournamentId).then( (data)=>{
      this.tournament = data 

      let evaluationIdx = this.tournament.evaluations.findIndex( e=> e.id == this.evaluationId )
      
      this.evaluation = this.tournament.evaluations[evaluationIdx]

      let FA = this.form.get('aspects') as FormArray
      FA.clear()
      if( FA ){
        
        this.evaluation.aspects.map( aspect =>
          FA.push(
            this.fb.group({
              id:[aspect.id],
              label:[aspect.label,Validators.required],
              description:[aspect.description]
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
    let aspect = this.form.get('aspects') as FormArray
    if( aspect ){
      aspect.push(
        this.fb.group({
          id:[null],
          label:['',Validators.required],
          description:['']
        })
      );
      this.isAdding = true
    }
  }
  onSubmit(){
    this.isAdding =false
    this.editingId = null   

    let aspectFGs = this.getAspectGroups()
    let aspectGrp = aspectFGs[ aspectFGs.length -1 ]
    let id = aspectGrp?.controls["id"].value
    let label = aspectGrp?.controls["label"].value
    let description = aspectGrp?.controls["description"].value
    let aspect:Aspect = { 
      id:uuidv4(),
      label: label,
      description: description ? description : ""
    }
    this.evaluation.aspects.push( aspect )
    let obj:Tournament = {
      evaluations:this.tournament.evaluations
    }        
    
    this.firebaseService.updateDocument( TournamentCollection.collectionName, this.tournamentId, obj).then( ()=>{
      console.log("evaluation and aspects list updated")
      this.isAdding = false
      this.update()
    },
    reason =>{
      alert("Error updating aspect list")
    })    
  }

  onSave(id:string) {
    this.isAdding =false
    this.editingId = null       
    if( id ){

      let FGs = this.getAspectGroups()
      let idx = FGs.findIndex( FG => FG.controls["id"].value == id )
      if( idx >= 0 ){
        let aspectGrp = FGs[idx]
        let label =  aspectGrp?.controls["label"].value.trim()
        let description =  aspectGrp?.controls["description"].value?.trim()

        this.evaluation.aspects[ idx ].label = label
        this.evaluation.aspects[ idx ].description = description ? description : ""
        let obj:Tournament = {
          evaluations:this.tournament.evaluations
        }        
        
        this.firebaseService.updateDocument( TournamentCollection.collectionName, this.tournamentId, obj).then( ()=>{
          console.log("evaluation aspect list updated")
          this.update()
        },
        reason =>{
          alert("Error updating aspect")
        })
      }
    }
  }

  onDelete(id:string) {
    this.isAdding =false
    this.editingId = null 

    let idx:number = this.evaluation.aspects.findIndex( c => c.id == id)

    if( idx >= 0){
      this.evaluation.aspects.splice(idx,1)
      let obj:Tournament = {
        evaluations:this.tournament.evaluations
      }
  
      this.firebaseService.updateDocument( TournamentCollection.collectionName, this.tournamentId, obj).then( ()=>{
        console.log("aspects list updated")
        this.update()
      },
      reason =>{
        alert("Error updating aspects")
      })
    }
  }
  onCancelAdd(){
    this.isAdding =false
    this.editingId = null      
    
    let FGs = this.getAspectGroups()
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