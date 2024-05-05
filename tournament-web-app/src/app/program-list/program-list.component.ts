import { AfterViewInit, Component, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {  EvaluationGradeCollection, EvaluationGradeObj, Performance, PerformanceCollection, PerformanceObj, Tournament, TournamentCollection, TournamentObj, PerformanceReference } from '../types';
import {MatGridListModule} from '@angular/material/grid-list';
import { FirebaseService } from '../firebase.service';
import { Unsubscribe } from 'firebase/auth';
import { doc, DocumentData, QuerySnapshot } from 'firebase/firestore';
import { EvaluationgradeListComponent } from '../evaluationgrade-list/evaluationgrade-list.component';
import { AuthService } from '../auth.service';
import {MatExpansionModule} from '@angular/material/expansion';
import { Filter, FirebaseFullService } from '../firebasefull.service';

interface EvaluationRef{
  id:string
  evaluation:EvaluationGradeObj
}

interface PerformanceRef{
  id:string
  performance:PerformanceObj
  evaluations:Array<EvaluationRef>
  medal:string
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
    ,MatExpansionModule
  ],
  templateUrl: './program-list.component.html',
  styleUrl: './program-list.component.css',

})
export class ProgramListComponent implements AfterViewInit, OnDestroy{
  @Input() tournamentId!:string
  @Input() tournament!:TournamentObj
  @Input() performanceReferences!:Array<PerformanceReference>

  performanceColor = 'lightblue'
  isAdmin = false

  unsubscribePerformances:Unsubscribe | undefined = undefined

  programReferences:Array<PerformanceRef> = []  



  constructor(private firebase:FirebaseFullService
    ,private auth:AuthService  
    
  ){

  }
  ngAfterViewInit(): void {
    this.update()
  }
   

  ngOnDestroy(): void {

    if( this.unsubscribePerformances ){
      this.unsubscribePerformances()
    }
  }  
  
  update(){
    if( this.tournament.creatorUid == this.auth.getUserUid() ){
      this.isAdmin = true
    }
    for( let i=0; i<this.performanceReferences.length; i++){
      let p = this.performanceReferences[0]
      let programRef:PerformanceRef={
        id: p.id,
        performance: p.performance,
        evaluations:[],
        medal: ''
      }
      this.firebase.onsnapShotCollection([TournamentCollection.collectionName,this.tournamentId,
      PerformanceCollection.collectionName, p.id,
      EvaluationGradeCollection.collectionName].join("/"),{
        'next': (set) =>{
          set.forEach( doc =>{
            let evaluation = doc.data() as EvaluationGradeObj
            let evaluacionRef:EvaluationRef = {
              id: doc.id,
              evaluation: evaluation
            }
            programRef.evaluations.push( evaluacionRef )
            
          })
        },
        'error': (reason) =>{
          alert("Error readind evaluation collection")
        }
      })
      this.programReferences.push( programRef )
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
    this.firebase.updateDocument( [TournamentCollection.collectionName, this.tournamentId,
                                          PerformanceCollection.collectionName].join("/"), performanceRef.id, obj).then( ()=>{
      console.log("Performance release updated")
    },
    reason =>{
      alert("Error actualizando la liberacion")
    })
  }   
  

  recalculateGrade(performanceRef:PerformanceReference){
    /*
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
            let average = Number( this.calculateAverage( evaluationGrades ).toFixed(1) )
            if( performanceRef.performance.grade != average ){
              performanceRef.performance.isReleased = false
            }
            performanceRef.performance.grade = average
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
    */                                     
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
