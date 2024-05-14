import { Component } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';
import { FirebaseFullService } from '../firebasefull.service';
import { PerformanceCollection,Performance, PerformanceObj, TournamentCollection, TournamentObj, Tournament } from '../types';
import { v4 as uuidv4, v4 } from 'uuid';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-performance-edit',
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
    ,MatSelectModule      
  ],
  templateUrl: './performance-edit.component.html',
  styleUrl: './performance-edit.component.css'
})
export class PerformanceEditComponent {
  tournamentId!:string 
  tournament:TournamentObj|null = null
  performanceId!:string 
  performance:PerformanceObj|null = null

  isAccepted = false

  canEdit = true

  isAdmin = false

  g = this.fb.group({
    id:[null],
    label:[""],
    categoryId:["",Validators.required],
    fullname:["",Validators.required],
    status:["en-aprovacion",Validators.required],
    academy:[""],
    coreographer:[""]
  })
  constructor(
    private activatedRoute: ActivatedRoute
    ,private auth:AuthService
    ,private router:Router
    ,private firebase:FirebaseFullService 
    ,private fb:FormBuilder
    ){
      var thiz = this
      this.activatedRoute.paramMap.subscribe( {
        next(paramMap){
          let tournamentId = paramMap.get('tournamentId')
          let performanceId = paramMap.get('performanceId')
          if(tournamentId != null && performanceId!= null)
            thiz.tournamentId = tournamentId!
            thiz.performanceId = performanceId!
            thiz.update()
          }
  
        })       
  }
    
  update(){
    if( this.tournamentId != null){
      let thiz = this
      this.firebase.onsnapShotDoc( TournamentCollection.collectionName, this.tournamentId,{
        next( doc ){
          thiz.tournament = doc.data() as TournamentObj
          if( thiz.auth.getUserUid() == thiz.tournament.creatorUid ){
            thiz.isAdmin = true
          }


          if( thiz.tournament.program.find( e => e == thiz.performanceId )){
            thiz.isAccepted = true
          }
  
          thiz.firebase.getDocument( 
            [TournamentCollection.collectionName,thiz.tournamentId, PerformanceCollection.collectionName].join("/")
            ,thiz.performanceId
          ).then( p =>{
            thiz.performance = p
            thiz.g.controls.label.setValue(p.label)
            thiz.g.controls.categoryId.setValue( p.categoryId )  
            thiz.g.controls.fullname.setValue( p.fullname )
            thiz.g.controls.academy.setValue( p.academy )
            thiz.g.controls.coreographer.setValue( p.academy )

            if( thiz.isAccepted || thiz.performance!.isCanceled ){
              thiz.canEdit = false
              thiz.g.controls.label.disable()
              thiz.g.controls.categoryId.disable()
              thiz.g.controls.fullname.disable()
              thiz.g.controls.academy.disable()
              thiz.g.controls.coreographer.disable()
            }
            else{
              thiz.canEdit = true
            }
          })
        },
        error( reason ){
          alert("Error reading performance")
        }
      })
    }
  }  

  onAccept(){
    if( this.tournament ){
      if(!this.tournament.program.find( e => e == this.performanceId)){
        this.tournament.program.push( this.performanceId )
        let obj:Tournament = {
          program:this.tournament.program
        }
        this.firebase.updateDocument( 
          TournamentCollection.collectionName,this.tournamentId, obj).then( ()=>{
          console.log("performances program update")
          this.router.navigate(["../../"], { relativeTo: this.activatedRoute })
        },
        reason =>{
            alert("Error updating performances:" + reason)
        })
      }
    }
  }  

  onReject(){
    if( this.tournament ){
      let index = this.tournament.program.findIndex( e => e == this.performanceId)
      if( (index >= 0) ){
        this.tournament.program.splice(index, 1)
        let obj:Tournament = {
          program:this.tournament.program
        }
        this.firebase.updateDocument( 
          TournamentCollection.collectionName,this.tournamentId, obj).then( ()=>{
          console.log("performances program update")
          this.router.navigate(["../../"], { relativeTo: this.activatedRoute })
        },
        reason =>{
            alert("Error updating performances:" + reason)
        })
      }
    }
  }  
  onCancel(){
    let obj:Performance = {
      isCanceled: true
    }
    this.firebase.updateDocument( 
      [TournamentCollection.collectionName,this.tournamentId,PerformanceCollection.collectionName].join("/")
      , this.performanceId, obj).then( ()=>{
      console.log("performances updated")
      this.router.navigate(["../../"], { relativeTo: this.activatedRoute })
    },
    reason =>{
      alert("Error updating performances:" + reason)
    })
  }
  onSubmit(){
    if( this.canEdit ){
      let label = this.g.controls["label"].value
      let categoryId = this.g.controls["categoryId"].value
      let fullname = this.g.controls["fullname"].value
      let email = this.auth.getUserEmail()

      let obj:Performance = {
        categoryId: categoryId!,
        fullname: fullname!,
        email: email!,
        label: label!,
      }
      let id=this.performanceId
      this.firebase.updateDocument( [TournamentCollection.collectionName,this.tournamentId,PerformanceCollection.collectionName].join("/"), id, obj).then( ()=>{
        console.log("performances added")
        this.router.navigate(["../../"], { relativeTo: this.activatedRoute })
      },
      reason =>{
        alert("Error updating performances:" + reason)
      })
    }
  }  
  onDelete(){
    let obj:Performance = {
      isCanceled:true,
      isDeleted:true
    }
    let id=this.performanceId
    this.firebase.updateDocument( [TournamentCollection.collectionName,this.tournamentId,PerformanceCollection.collectionName].join("/"), id, obj).then( ()=>{
      console.log("performances deleted")
      this.router.navigate(["../../"], { relativeTo: this.activatedRoute })
    },
    reason =>{
      alert("Error updating performances:" + reason)
    })
  }  

}
