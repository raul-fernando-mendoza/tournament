import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseService } from '../firebase.service';
import { AspectCollection, AspectObj, EvaluationCollection, TournamentCollection, TournamentObj} from '../types'
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {MatCardModule} from '@angular/material/card';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { v4 as uuidv4 } from 'uuid';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { PathService } from '../path.service';
import { AuthService } from '../auth.service';
import { BusinesslogicService } from '../businesslogic.service';

@Component({
  selector: 'app-aspect-component',
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
  templateUrl: './aspect-component.html',
  styleUrl: './aspect-component.css'
})
export class AspectComponent implements OnInit{
  id:string | null = null
  tournamentId!:string 
  evaluationId!:string

  collection = AspectCollection.collectionName
  submitting = false

  form = this.fb.group({
    label:['',Validators.required],
    description:['']
  })
  isAdmin:boolean=false


  aspect:AspectObj| null = null
  
  constructor( public firebaseService:FirebaseService 
    ,private fb:FormBuilder
    ,private activatedRoute: ActivatedRoute    
    ,private router: Router
    ,public pathService: PathService
    ,private authService: AuthService
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
            if( paramMap.get('evaluationId')!=null ){
              var str : string | null = paramMap.get('evaluationId')
              if ( str != null){
                thiz.evaluationId = decodeURIComponent(str)
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
        TournamentCollection.collectionName + "/" + this.tournamentId + "/" + EvaluationCollection.collectionName + "/" + this.evaluationId + "/" + this.collection,
        this.id).then( doc =>{
         this.aspect = doc as AspectObj
         this.form.controls.label.setValue( this.aspect.label)
         if( this.aspect.description ){
          this.form.controls.description.setValue( this.aspect.description )
         }
      })    
    }
  }
  onCancel(){
    this.router.navigate(['/' + TournamentCollection.collectionName + "/" + this.tournamentId + "/" + EvaluationCollection.collectionName + "/" + this.evaluationId ])
  }
  onSubmit(){
    console.log( "adding")
    let id = uuidv4();
    var label = this.form.controls.label.value!
    var description = this.form.controls.description.value!
    var obj:AspectObj = {
      label: label,
      description: description
    }
    this.submitting = true
    this.firebaseService.setDocument( TournamentCollection.collectionName + "/" + this.tournamentId + "/" + EvaluationCollection.collectionName + "/" + this.evaluationId + "/" + this.collection, id, obj).then(data =>{
        console.log("aspect added")
      },
      reason=>{
        alert("Error adding aspect" + reason)
      })
    .then( () =>{
        return this.firebaseService.unionArrayElementDoc( TournamentCollection.collectionName + "/" + this.tournamentId + "/" + EvaluationCollection.collectionName + "/" + this.evaluationId, this.collection, id).then( ()=>{
          console.log("aspect added to parent")
        },
        reason=>{
          alert("ERROR adding aspect to parent:"+reason)
        })
    })
    .then( ()=>{
      this.router.navigate(["/" + TournamentCollection.collectionName + "/" + this.tournamentId + "/" + EvaluationCollection.collectionName + "/" + this.evaluationId + "/" + this.collection + "/" + id ])

    })
  }

  onDelete( ){
    if( !confirm("Esta seguro de querer borrar:" +  this.aspect!.label) ){
      return
    }        
    this.firebaseService.removeArrayElementDoc( TournamentCollection.collectionName + "/" + this.tournamentId + "/" + EvaluationCollection.collectionName + "/" + this.evaluationId , AspectCollection.collectionName, this.id!).then( ()=>{
      console.log("the item has been removed from the parent")
      },
      reason=>{
        alert("ERROR: removng from parent:" + this.collection + " " + reason)
    }).then( ()=>{
      return this.firebaseService.deleteDocument( TournamentCollection.collectionName + "/" + this.tournamentId + "/" + EvaluationCollection.collectionName + "/" + this.evaluationId + "/" + this.collection , this.id! ).then( ()=>{
        console.log( "category removed")
        
      },
      reason =>{
        alert("ERROR removing:" + this.collection + " " + reason)
      })
    }).then( ()=>{
      console.log("end")
      this.router.navigate(["/" + TournamentCollection.collectionName + "/" + this.tournamentId + "/" + EvaluationCollection.collectionName + "/" + this.evaluationId ])
    },
    reason=>{
      alert("Error onDelete:" + reason)
    })
  }

  onChange($event:any, attribute:string){
    if( this.id ){
      this.firebaseService.onChange($event, TournamentCollection.collectionName + "/" + this.tournamentId + "/" + EvaluationCollection.collectionName + "/" + this.evaluationId + "/" + this.collection,this.id,attribute).then( ()=>{
        console.log("onchange updated") 
        this.update()
      })
    }
  }  

}
