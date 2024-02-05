import { Component, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FirebaseService } from '../firebase.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {  Performance, PerformanceCollection, PerformanceObj, Tournament, TournamentCollection, TournamentObj } from '../types';
import {MatGridListModule} from '@angular/material/grid-list';
import { FirebaseFullService } from '../firebasefull.service';
import { Unsubscribe } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { EvaluationgradeListComponent } from '../evaluationgrade-list/evaluationgrade-list.component';

interface PerformanceReference{
  id:string
  performance:PerformanceObj
}
@Component({
  selector: 'app-program-list',
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
    ,MatGridListModule
    ,EvaluationgradeListComponent
  ],
  templateUrl: './program-list.component.html',
  styleUrl: './program-list.component.css',

})
export class ProgramListComponent implements OnDestroy{
  tournamentId!:string
  tournament!:TournamentObj
  performances:Array<PerformanceReference> = []

  performanceColor = 'lightblue'
  
  unsubscribers:Array<Unsubscribe> = []

  constructor( public firebaseService:FirebaseService 
    ,private firebaseFullService:FirebaseFullService
    ,private fb:FormBuilder
    ,private activatedRoute: ActivatedRoute    
  ){
    var thiz = this
    this.activatedRoute.paramMap.subscribe({
        next(paramMap){
          let tournamentId = paramMap.get('tournamentId')
          if( tournamentId!=null ){
            thiz.tournamentId = tournamentId
            thiz.update()
          }
        }
      })
  }
  ngOnDestroy(): void {
    this.unsubscribers.map( unsubscribe =>{
      unsubscribe()
    })
  }
  update(){
    let unsubscribe = this.firebaseFullService.onsnapShotDoc( TournamentCollection.collectionName, this.tournamentId,
      {
        'next':(doc) =>{
          this.tournament = doc.data() as TournamentObj 
          this.readPerformances()
        },
        'error':(reason) =>{
          alert("Error snapshot on Tournament:" + reason)
        },
        'complete':() =>{
          console.log("onsnapshot on tournament has completed")
        }
    })
    this.unsubscribers.push( unsubscribe )
  }

  readPerformances(){
    this.performances.length = 0

    this.tournament.program.map( programId =>{
      let unsubscribe =this.firebaseFullService.onsnapShotDoc( [TournamentCollection.collectionName,this.tournamentId, PerformanceCollection.collectionName].join("/") , programId,
        {
          'next':(doc) =>{
            let performance = doc.data() as PerformanceObj
            let idx = this.tournament.program.findIndex( e => e == doc.id)
            if(  idx >=0 ){
              let performanceRef:PerformanceReference={
                id:doc.id,
                performance:performance
              }
              this.performances[idx] = performanceRef
            }
          },
          'error':(reason) =>{
            alert("there has been an error reading performances:" + reason)
          },
          'complete':() =>{
            console.log("reading program as ended")
          }
      })
      this.unsubscribers.push( unsubscribe )
    })
  }
  onPerformanceUp(performanceId:string){
    let idx = this.tournament.program.findIndex( e => e == performanceId)
    if( idx > 0){
      this.tournament.program.splice( idx, 1)
      this.tournament.program.splice( idx - 1, 0, performanceId)
      let obj:Tournament = {
        program:this.tournament.program
      }
      this.firebaseService.updateDocument( TournamentCollection.collectionName, this.tournamentId, obj).then( ()=>{
        console.log("program updated")
      },
      reason =>{
        alert("Error updating program" + reason)
      })
    }
  }
  onPerformanceDown(performanceId:string){
    let idx = this.tournament.program.findIndex( e => e == performanceId)
    if( idx < (this.tournament.program.length - 1)){
      this.tournament.program.splice( idx, 1)
      this.tournament.program.splice( idx + 1, 0, performanceId)
      let obj:Tournament = {
        program:this.tournament.program
      }
      this.firebaseService.updateDocument( TournamentCollection.collectionName, this.tournamentId, obj).then( ()=>{
        console.log("program updated")
      },
      reason =>{
        alert("Error updating program" + reason)
      })
    }
  }
  getMedalForPerformance(grade:number):string{
    for( let i = 0; i < this.tournament.medals.length; i++){
      if( grade >= this.tournament.medals[i].minGrade ){
        return this.tournament.medals[i].label
      }
    }
    return ""
  } 
  onRelease(performanceId:string){
    let idx = this.tournament.program.findIndex( e => e == performanceId)
    if( idx < (this.tournament.program.length - 1)){
      let obj:Performance = {
        isReleased:true
      }
      this.firebaseService.updateDocument( [TournamentCollection.collectionName, this.tournamentId,
                                            PerformanceCollection.collectionName].join("/"), performanceId, obj).then( ()=>{
        console.log("Performance release updated")
      },
      reason =>{
        alert("Error actualizando la liberacion")
      })
    }
  }   

}
