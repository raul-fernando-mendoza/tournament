import { AfterViewInit, Component, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { PerformanceCollection, PerformanceObj, Tournament, TournamentCollection, TournamentObj, PerformanceReference } from '../types';
import { MatGridListModule } from '@angular/material/grid-list';
import { Unsubscribe } from 'firebase/auth';
import { EvaluationgradeListComponent } from '../evaluationgrade-list/evaluationgrade-list.component';
import { AuthService } from '../auth.service';
import {MatExpansionModule} from '@angular/material/expansion';
import { Filter, FirebaseFullService } from '../firebasefull.service';
import { BusinesslogicService } from '../businesslogic.service';
import { MatChipsModule } from '@angular/material/chips';

interface ProgramRef{
  id:string
  performance:PerformanceObj
  noEvaluationsFound:boolean
  newGradeAvailable:boolean
  medal:string
}

@Component({
  selector: 'app-program-list',
  standalone: true,
  imports: [
    CommonModule
    ,MatIconModule
    ,MatButtonModule  
    ,MatChipsModule    
    ,RouterModule
    ,MatGridListModule
    ,EvaluationgradeListComponent
    ,MatExpansionModule
  ],
  templateUrl: './program-list.component.html',
  styleUrl: './program-list.component.css',

})
export class ProgramListComponent implements AfterViewInit, OnDestroy{
  @Input() tournamentId!:string
  @Input() tournament!:TournamentObj

  isAdmin = false

  unsubscribe:Unsubscribe | undefined = undefined
  unsubscribePerformances:Unsubscribe | undefined = undefined

  programRefs:Array<ProgramRef> = []  

  constructor(private firebase:FirebaseFullService
    ,private auth:AuthService  
    ,private business:BusinesslogicService
  ){

  }
  ngAfterViewInit(): void {
    this.update()
  }
   

  ngOnDestroy(): void {

    if( this.unsubscribe ){
      this.unsubscribe()
    }
    if( this.unsubscribePerformances ){
      this.unsubscribePerformances()
    }
  }  
  
  update(){
    if( this.tournament.creatorUid == this.auth.getUserUid() ){
      this.isAdmin = true
    }
    this.unsubscribe = this.firebase.onsnapShotDoc( TournamentCollection.collectionName, this.tournamentId, 
      {
      'next': (doc) =>{
        this.tournament = doc.data() as TournamentObj
        this.readPerformances()
      },
      'error': (reason)=>{
        alert("Error reading tournament:" + reason)
      }
    })    
  }

  readPerformances(){
    let filter:Array<Filter> = []
    if( this.unsubscribePerformances ){
      this.unsubscribePerformances()
    }  
    this.unsubscribePerformances = this.firebase.onsnapShotCollection(
      [TournamentCollection.collectionName,this.tournamentId, PerformanceCollection.collectionName].join("/") 
      ,{
        'next': (set)=>{
          this.programRefs.length = 0
          set.docs.map( doc =>{
            let performance = doc.data() as PerformanceObj
            //check if the performance is in the program
            let idx = this.tournament!.program.findIndex( e => e == doc.id )
            if( idx >= 0 ){
              let pr:ProgramRef = {
                id: doc.id,
                performance: performance,
                noEvaluationsFound: false,
                medal: this.business.getMedalForPerformance(this.tournament!, performance.grade),
                newGradeAvailable: false
              }
              this.programRefs[idx] = pr 
            }
          })
      }  
    })
  }
  onNewGradeAvailable(newGradeAvailable:boolean, p:ProgramRef){
    if( p.newGradeAvailable != newGradeAvailable ){
      p.newGradeAvailable = newGradeAvailable
    }
  }
  onNoEvaluationFound(noEvaluationFound:boolean, p:ProgramRef){
    if( p.noEvaluationsFound != noEvaluationFound ){
      p.noEvaluationsFound = noEvaluationFound
    }
  }
  onReject( id:string ){
    this.firebase.removeArrayElementDoc( TournamentCollection.collectionName + "/" + this.tournamentId, "program", id).then( ()=>{
      console.log("update programa")
    },
    reason =>{
      alert("Error updating programa:" + reason)
    }) 
  }  
  onPerformanceUp(performanceId:string){
    if( this.tournament ){
      let idx = this.tournament.program.findIndex( e => e == performanceId)
      if( idx > 0){
        this.tournament.program.splice( idx, 1)
        this.tournament.program.splice( idx - 1, 0, performanceId)
        let obj:Tournament = {
          program:this.tournament.program
        }
        this.firebase.updateDocument( TournamentCollection.collectionName, this.tournamentId, obj).then( ()=>{
          console.log("program updated")
        },
        reason =>{
          alert("Error moviendo performance arriba" + reason)
        })
      }
    }
  }
  onPerformanceDown(performanceId:string){
    if( this.tournament ){
      let idx = this.tournament.program.findIndex( e => e == performanceId)
      if( idx < (this.tournament.program.length - 1)){
        this.tournament.program.splice( idx, 1)
        this.tournament.program.splice( idx + 1, 0, performanceId)
        let obj:Tournament = {
          program:this.tournament.program
        }
        this.firebase.updateDocument( TournamentCollection.collectionName, this.tournamentId, obj).then( ()=>{
          console.log("program updated")
        },
        reason =>{
          alert("Error moviendo performance abajo" + reason)
        })
      }
    }
  }
  onReleaseProgram(isProgramReleased:boolean){
    let obj:Tournament = {
      isProgramReleased : isProgramReleased
    }
    this.firebase.updateDocument( TournamentCollection.collectionName, this.tournamentId, obj).then( ()=>{
      console.log("Tournament released")
    },
    reason =>{
      alert("Error actualizando la liberacion")
    })    
  }
      
}
