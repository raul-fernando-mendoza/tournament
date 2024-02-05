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
  selector: 'app-podium-list',
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
  templateUrl: './podium-list.component.html',
  styleUrl: './podium-list.component.css',

})
export class PodiumListComponent implements OnDestroy{
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
            if( performance.isReleased ){
              let performanceRef:PerformanceReference={
                id:doc.id,
                performance:performance
              }
              let idx = this.performances.findIndex( e => e.id == doc.id)
              if( idx < 0){
                this.performances.push(performanceRef)
              }
              this.performances.sort( (a,b)=>a.performance.grade > b.performance.grade ? -1: 1)
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
  getMedalForPerformance(grade:number):string{
    for( let i = 0; i < this.tournament.medals.length; i++){
      if( grade >= this.tournament.medals[i].minGrade ){
        return this.tournament.medals[i].label
      }
    }
    return ""
  } 
}
