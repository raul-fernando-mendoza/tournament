import { Component, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FirebaseService } from '../firebase.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {  EvaluationGradeCollection, EvaluationGradeObj, Performance, PerformanceCollection, PerformanceObj, Tournament, TournamentCollection, TournamentObj } from '../types';
import {MatGridListModule} from '@angular/material/grid-list';
import { FirebaseFullService } from '../firebasefull.service';
import { Unsubscribe } from 'firebase/auth';
import { doc, DocumentData, QuerySnapshot } from 'firebase/firestore';
import { EvaluationgradeListComponent } from '../evaluationgrade-list/evaluationgrade-list.component';
import { AuthService } from '../auth.service';

interface PerformanceReference{
  id:string
  performance:PerformanceObj
  medal:string
  idx:number
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
  isAdmin = false
  tournament_unsubscribe:Unsubscribe = ()=>{}
  performance_unsubscribers:Array<Unsubscribe> = []
  evaluation_unsubscribers:Array<Unsubscribe> = []

  evaluationGradesReferences: any;

  constructor( public firebaseService:FirebaseService 
    ,private firebaseFullService:FirebaseFullService
    ,private fb:FormBuilder
    ,private activatedRoute: ActivatedRoute  
    ,private auth:AuthService  
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
    if( this.tournament_unsubscribe ){
      this.tournament_unsubscribe()
    }    
    this.performance_unsubscribers.map( unsubscribe =>{
      unsubscribe()
    })
    this.evaluation_unsubscribers.map( unsubscribe =>{
      unsubscribe()
    })    
  }
  update(){
    if( this.tournament_unsubscribe ){
      this.tournament_unsubscribe()
    }
    this.tournament_unsubscribe =this.firebaseFullService.onsnapShotDoc( TournamentCollection.collectionName,this.tournamentId,
      {
        'next':(doc) =>{      
            this.performances.length = 0
            this.tournament = doc.data() as TournamentObj 
            if( this.tournament.creatorUid == this.auth.getUserUid() ){
              this.isAdmin = true
            }
            this.readPerformances()
        },
        'error':(reason) =>{
          alert("ha habido un error leyendo el programa:" + reason)
        },
        'complete':() =>{
          console.log("reading program as ended")
        }
      }
    )

  }

  readPerformances(){
    this.performance_unsubscribers.map( unsub => unsub() )
    this.evaluation_unsubscribers.map( unsub => unsub() )
    this.performances.length = 0  

    
    this.tournament.program.map( programId =>{
      console.log("reading program:" + programId)
      let unsubscribe =this.firebaseFullService.onsnapShotDoc( [TournamentCollection.collectionName,this.tournamentId, PerformanceCollection.collectionName].join("/") , programId,
        {
          'next':(doc) =>{
            let performance = doc.data() as PerformanceObj

            console.log("reading performance:" + performance.label)
            let idx = this.tournament.program.findIndex( e => e == doc.id)
            
            if(  idx >=0 ){
              let performanceRef:PerformanceReference={
                id:doc.id,
                performance:performance,
                medal:"",
                idx:idx
              }
              this.performances[idx] = performanceRef
              if( performance.isReleased == false ){
                let grade = this.recalculateGrade( performanceRef )
              }
              else{
                performanceRef.medal = this.getMedalForPerformance( performanceRef.performance.grade )
              }
            }
            
          },
          'error':(reason) =>{
            alert("ha habido un error leyendo el programa:" + reason)
          },
          'complete':() =>{
            console.log("reading program as ended")
          }
      })
      this.performance_unsubscribers.push( unsubscribe )
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
        alert("Error moviendo performance arriba" + reason)
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
        alert("Error moviendo performance abajo" + reason)
      })
    }
  }
  getMedalForPerformance(grade:number):string{
    console.log("calculating medasl for:" + grade)
    for( let i = 0; i < this.tournament.medals.length; i++){
      if( grade >= this.tournament.medals[i].minGrade ){
        return this.tournament.medals[i].label  
      }
    }
    return ""
  } 
  onRelease(performanceRef:PerformanceReference){
    let obj:Performance = {
      grade:performanceRef.performance.grade,
      isReleased:true
    }
    this.firebaseService.updateDocument( [TournamentCollection.collectionName, this.tournamentId,
                                          PerformanceCollection.collectionName].join("/"), performanceRef.id, obj).then( ()=>{
      console.log("Performance release updated")
    },
    reason =>{
      alert("Error actualizando la liberacion")
    })
  }   
  

  recalculateGrade(performanceRef:PerformanceReference){
      let unsubscribe = this.firebaseFullService.onsnapShotCollection( [TournamentCollection.collectionName, this.tournamentId
                                        , PerformanceCollection.collectionName, performanceRef.id
                                        , EvaluationGradeCollection.collectionName].join("/"),
        {
          'next':(snapshot: QuerySnapshot<DocumentData>) =>{
            let evaluationGrades:Array<EvaluationGradeObj> = []
            snapshot.docs.map( doc =>{
              let evaluationGrade = doc.data() as EvaluationGradeObj
              evaluationGrades.push( evaluationGrade ) 
            })
            let average = this.calculateAverage( evaluationGrades )
            performanceRef.performance.grade = Number(average.toFixed(1))
            performanceRef.medal = this.getMedalForPerformance(performanceRef.performance.grade)
          },
          'error':(reason) =>{
            alert("there has been an error reading performances:" + reason)
          },
          'complete':() =>{
            console.log("reading program as ended")
        }
    })
    this.evaluation_unsubscribers.push(unsubscribe)                                        
  }  

  calculateAverage(evaluationGrades:Array<EvaluationGradeObj>):Number{
    let total = 0
    let cnt = 0
    evaluationGrades.map( evaluationGrade =>{
      if( evaluationGrade.isCompleted ){
        total += evaluationGrade.grade
        cnt += 1
      }
    })
    if( cnt > 0 ){
      let newGrade = Number((total/cnt).toFixed(1))
      return newGrade
    }
    return 0
  }
  
}
