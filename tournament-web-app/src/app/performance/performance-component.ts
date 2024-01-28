import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseService } from '../firebase.service';
import { PerformanceCollection, PerformanceObj, Performance, TournamentCollection, EvaluatorCollection, EvaluatorObj, Evaluation, Evaluator, AspectGrade} from '../types'
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
import {MatSelectModule} from '@angular/material/select';
import { BusinesslogicService } from '../businesslogic.service';
import { EvaluationGradeComponent } from '../evaluationgrade/evaluationgrade-component';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatCheckboxModule} from '@angular/material/checkbox';

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
   MatButtonModule,
   MatSelectModule,
   EvaluationGradeComponent,
   MatGridListModule,
   MatCheckboxModule
],
  templateUrl: './performance-component.html',
  styleUrl: './performance-component.css'
})
export class PerformanceComponent implements OnInit{
  id:string | null = null
  tournamentId!:string 

  collection = PerformanceCollection.collectionName
  submitting = false

  form = this.fb.group({
    label:['',Validators.required],
    categoryId:['',Validators.required],
    owner:['',Validators.required],
    isAccepted:[false]
  })
  isAdmin:boolean=false
  isOwner:boolean=false


  performance:PerformanceObj| null = null

  categories:Array<
    {
      id:string, label:string
    }    
  > = []


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
      if( !isAdmin ){
        this.form.controls.owner.setValue( this.authService.getUserEmail() )
      }
    })
  }
  update(){
    if ( this.id ){
      this.firebaseService.getDocument(
        TournamentCollection.collectionName + "/" + this.tournamentId + "/" + this.collection,
        this.id).then( doc =>{
          this.performance = doc as PerformanceObj
         
          if( this.performance.owner == this.authService.getUserEmail() ){
            this.isOwner = true
          }

          this.form.controls.label.setValue( this.performance.label)
          
          if( this.performance.owner ){
            this.form.controls.owner.setValue( this.performance.owner )
          }
          if( this.performance.categoryId ){
            this.form.controls.categoryId.setValue( this.performance.categoryId )
          }  
          if( this.performance.isAccepted ){
            this.form.controls.isAccepted.setValue( this.performance.isAccepted )
          }   
          if( !this.isAdmin ){
            if( this.performance?.isAccepted ){
              this.form.controls.label.disable()
              this.form.controls.categoryId.disable()
              this.form.controls.isAccepted.disable()
            }  
          } 
      })
    }
    else{
      if( !this.isAdmin ){
        this.form.controls.owner.setValue(this.authService.getUserEmail())
      }
    }
  }
  onCancel(){
    this.router.navigate(['/' + TournamentCollection.collectionName + "/" + this.tournamentId])
  }
  onSubmit(){
    console.log( "adding")
    let id = uuidv4();
    var label = this.form.controls.label.value!
    var owner = this.form.controls.owner.value!
    var categoryId = this.form.controls.categoryId.value!
    var obj:PerformanceObj = {
      label: label,
      categoryId: categoryId,
      owner: owner,
      isAccepted: false,
      grade: 10,
      overwrittenGrade: 10,
      isReleased: false
    }
    this.submitting = true
    this.firebaseService.setDocument( TournamentCollection.collectionName + "/" + this.tournamentId + "/" + this.collection, id, obj).then(data =>{
      this.router.navigate([ "/" + TournamentCollection.collectionName + "/" + this.tournamentId + "/" + PerformanceCollection.collectionName + "/" + id ])
    },
    reason =>{
      alert("Error creating exam:" + reason)
    })
  }

  onDelete( ){
    if( !confirm("Esta seguro de querer borrar:" +  this.performance!.label) ){
      return
    }        

    this.firebaseService.deleteDocument( TournamentCollection.collectionName + "/" + this.tournamentId + "/" + this.collection , this.id! ).then( ()=>{
      console.log( "performance removed")
      this.router.navigate(["/" + TournamentCollection.collectionName + "/" + this.tournamentId])
    },
    reason =>{
      alert("ERROR removing:" + this.collection + " " + reason)
    })

  }

  onChange($event:any, attribute:string){
    if( this.id ){
      this.firebaseService.onChange($event, TournamentCollection.collectionName + "/" + this.tournamentId + "/" + this.collection,this.id,attribute).then( ()=>{
        console.log("onchange updated") 
        this.update()
      })
    }
  }  
  onCategoryChange($event:any){
    if( this.id ){
      let categoryId = this.form.controls.categoryId.value!
      let obj:Performance = {
        categoryId:categoryId
      }
      this.firebaseService.updateDocument(TournamentCollection.collectionName + "/" + this.tournamentId + "/" + this.collection, this.id!, obj).then( ()=>{
        console.log("onCategoryChange updated") 
        this.update()
      },
      reason =>{
        alert("ERROR updating category:" + reason)
      })
    }
  }
  onIsAcceptedChange($event:any){
    if( this.id ){
      let isAccepted = this.form.controls.isAccepted.value!
      let obj:Performance = {
        isAccepted:isAccepted
      }
      this.firebaseService.updateDocument(TournamentCollection.collectionName + "/" + this.tournamentId + "/" + this.collection, this.id!, obj).then( ()=>{
        console.log("onIsAcceptedChange updated") 
        this.update()
      },
      reason =>{
        alert("ERROR updating isAccepted:" + reason)
      })
    }
  } 
}
