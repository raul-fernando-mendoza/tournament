import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseService } from '../firebase.service';
import { AspectCollection, AspectObj, EvaluationCollection, EvaluationObj, TournamentCollection} from '../types'
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
import { ListComponent } from '../list/list-component';
import { BusinesslogicService } from '../businesslogic.service';

interface AspectReference{
  id:string
  aspect:AspectObj
}

@Component({
  selector: 'app-evaluation-component',
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
   MatButtonModule,
   ListComponent
],
  templateUrl: './evaluation-component.html',
  styleUrl: './evaluation-component.css'
})
export class EvaluationComponent implements OnInit{
  id:string | null = null
  tournamentId!:string 

  collection = EvaluationCollection.collectionName
  submitting = false

  form = this.fb.group({
    label:['',Validators.required]
  })
  isAdmin:boolean=false


  evaluation:EvaluationObj| null = null

  aspectReferences:Array<AspectReference> = []
  
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
    this.getAspects()
  }
  update(){
    if ( this.id ){
      this.firebaseService.getDocument(
        TournamentCollection.collectionName + "/" + this.tournamentId + "/" + this.collection,
        this.id).then( doc =>{
         this.evaluation = doc as EvaluationObj
         this.form.controls.label.setValue( this.evaluation.label)
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
    var obj:EvaluationObj = {
      label: label,
      aspect: []
    }
    this.submitting = true
    this.firebaseService.setDocument( TournamentCollection.collectionName + "/" + this.tournamentId + "/" + this.collection, id, obj).then(data =>{
      this.router.navigate(["/" + TournamentCollection.collectionName + "/" + this.tournamentId + "/" + EvaluationCollection.collectionName + "/" + id])
    },
    reason =>{
      alert("Error creating exam:" + reason)
    })
    .then( () =>{
        return this.firebaseService.unionArrayElementDoc( TournamentCollection.collectionName + "/" + this.tournamentId, this.collection, id).then( ()=>{
          console.log("aspect added to parent")
        },
        reason=>{
          alert("ERROR adding aspect to parent:"+reason)
        })
    })
    .then( ()=>{
      this.router.navigate(["/" + TournamentCollection.collectionName + "/" + this.tournamentId + "/" + this.collection + "/" + id])

    })    
    
  }

  onDelete( ){
    if( !confirm("Esta seguro de querer borrar:" +  this.evaluation!.label) ){
      return
    }        
    this.firebaseService.removeArrayElementDoc( TournamentCollection.collectionName + "/" + this.tournamentId , EvaluationCollection.collectionName, this.id!).then( ()=>{
      console.log("the item has been removed from the parent")
      },
      reason=>{
        alert("ERROR: removng from parent:" + this.collection + " " + reason)
    }).then( ()=>{
      return this.firebaseService.deleteDocument( TournamentCollection.collectionName + "/" + this.tournamentId + "/" + this.collection , this.id! ).then( ()=>{
        console.log( "category removed")
        
      },
      reason =>{
        alert("ERROR removing:" + this.collection + " " + reason)
      })
    }).then( ()=>{
      console.log("end")
      this.router.navigate([this.pathService.getPreviousPath(TournamentCollection.collectionName + "/" + this.tournamentId)])
    },
    reason=>{
      alert("Error onDelete:" + reason)
    })
  }
  onChange($event:any, attribute:string){
    this.firebaseService.onChange($event, TournamentCollection.collectionName + "/" + this.tournamentId + "/" + this.collection,this.id,attribute).then( ()=>{
      console.log("onchange updated") 
      this.update()
    })
  } 
  getAspects():Promise<void>{
    return new Promise<void>( (resolve, reject)=>{
      this.firebaseService.getDocuments( TournamentCollection.collectionName + "/" + this.tournamentId + "/" + this.collection + "/" + this.id + "/" + AspectCollection.collectionName ).then( set =>{
        set.map( doc =>{
          let a:AspectObj = doc.data() as AspectObj
          let j:AspectReference = {
            id: doc.id,
            aspect: a
          }
          let idx = this.evaluation!.aspect.findIndex( e=> e == doc.id )
          if( idx >= 0){
            this.aspectReferences[idx] =  j 
          }
        })
      })
    })
  }     

}
