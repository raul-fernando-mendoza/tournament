import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseService } from '../firebase.service';
import { EvaluatorCollection, EvaluatorObj, TournamentCollection} from '../types'
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {MatCardModule} from '@angular/material/card';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { v4 as uuidv4 } from 'uuid';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { PathService } from '../path.service';
import { BusinesslogicService } from '../businesslogic.service';

@Component({
  selector: 'app-evaluator-component',
  standalone: true,
  imports: [
   CommonModule, 
   MatCardModule, 
   RouterModule,
   FormsModule,
   ReactiveFormsModule,
   MatFormFieldModule,
   MatInputModule,
   MatIconModule,
   MatButtonModule
],
  templateUrl: './evaluator-component.html',
  styleUrl: './evaluator-component.css'
})
export class EvaluatorComponent implements OnInit{
  id:string | null = null
  tournamentId!:string 

  collection = EvaluatorCollection.collectionName
  submitting = false

  form = this.fb.group({
    label:['',Validators.required],
    email:['']
  })
  isAdmin:boolean=false


  evaluator:EvaluatorObj| null = null
  
  constructor( public firebaseService:FirebaseService 
    ,private fb:FormBuilder
    ,private activatedRoute: ActivatedRoute    
    ,private router: Router
    ,public pathService: PathService
    ,private bussinesslogicService:BusinesslogicService   
    ){
      var thiz = this
      this.activatedRoute.paramMap.subscribe({
          next(paramMap){
            thiz.id = null
            if( paramMap.get('tournamentId')!=null ){
              var str : string | null = paramMap.get('tournamentId')
              if ( str != null){
                thiz.tournamentId = decodeURIComponent(str)          
              }
            }     
            if( paramMap.get('id')!=null ){
              thiz.id = paramMap.get('id')
              thiz.update()
            }
          }
        })
  }
  ngOnInit(): void {
    this.bussinesslogicService.getIsAdmin(TournamentCollection.collectionName + "/" + this.tournamentId).then( isAdmin=>{
      this.isAdmin = isAdmin
    })  
  }
  update(){
    if ( this.id ){
      this.firebaseService.getDocument(
        TournamentCollection.collectionName + "/" + this.tournamentId + "/" + this.collection,
        this.id).then( doc =>{
         this.evaluator = doc as EvaluatorObj
         this.form.controls.label.setValue( this.evaluator.label)
         if( this.evaluator.email ){
          this.form.controls.email.setValue( this.evaluator.email)
         }
      })    
    }
  }
  onCancel(){
    this.router.navigate(['/' + TournamentCollection.collectionName + "/" + this.tournamentId])
  }
  onSubmit(){
    console.log( "adding")
    let id = uuidv4();
    var label = this.form.controls.label.value!
    var email = this.form.controls.email.value ? this.form.controls.email.value : ""
    var obj:EvaluatorObj = {
      label: label,
      email:email
    }
    this.submitting = true
    this.firebaseService.setDocument( TournamentCollection.collectionName + "/" + this.tournamentId + "/" + this.collection, id, obj).then(data =>{
      this.router.navigate(["/" + TournamentCollection.collectionName + "/" + this.tournamentId + "/" + EvaluatorCollection.collectionName + "/" + id ])
    },
    reason =>{
      alert("Error creating evaluador:" + reason)
    })
  }

  onDelete( ){
    if( !confirm("Esta seguro de querer borrar:" +  this.evaluator!.label) ){
      return
    }        
    this.firebaseService.deleteDocument( TournamentCollection.collectionName + "/" + this.tournamentId + "/" + this.collection , this.id! ).then( ()=>{
        console.log( "evaluator removed")
        this.router.navigate(['/' + TournamentCollection.collectionName + "/" + this.tournamentId])
      },
      reason =>{
        alert("ERROR removing evaluator:" + this.collection + " " + reason)
    })
  }
  onChange($event:any,  attribute:string){
    if( this.id ){
      this.firebaseService.onChange($event, TournamentCollection.collectionName + "/" + this.tournamentId + "/" + this.collection,this.id,attribute).then( ()=>{
        console.log("onchange updated") 
        this.update()
      })
    }
  }  

}
