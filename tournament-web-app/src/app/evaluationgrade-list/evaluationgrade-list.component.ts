import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseService } from '../firebase.service';
import { AspectGrade, EvaluationGradeCollection, EvaluationGradeObj, Juror, Performance, PerformanceCollection, PerformanceObj, TournamentCollection, TournamentObj  } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule} from '@angular/material/grid-list';
import { RouterModule } from '@angular/router';
import { DocumentData, DocumentSnapshot, QuerySnapshot, Unsubscribe, where, WhereFilterOp } from 'firebase/firestore';
import { FirebaseFullService } from '../firebasefull.service';
import { AuthService } from '../auth.service';

interface EvaluationGradeReference{
  id:string
  evaluationGrade:EvaluationGradeObj
}

@Component({
  selector: 'app-evaluationgrade-list',
  standalone: true,
  imports: [
   CommonModule
  ,MatButtonModule
  ,MatIconModule
  ,MatGridListModule
  ,RouterModule],
  templateUrl: './evaluationgrade-list.component.html',
  styleUrl: './evaluationgrade-list.component.css'
})
export class EvaluationgradeListComponent implements OnInit, OnDestroy {
  
  @Input() tournamentId!:string
  @Input() tournament!:TournamentObj
  @Input() performanceId!:string 
  @Input() performance!:PerformanceObj

  evaluationGradesReferences:Array<EvaluationGradeReference> = []  

  unsubscribers:Array<Unsubscribe> = []
  isAdmin = false

  constructor(
    private firebaseService:FirebaseService,
    private firebaseFullService:FirebaseFullService,
    private auth:AuthService
  ){

  }
  ngOnDestroy(): void {
    this.unsubscribers.map( unsubscribe =>{
      unsubscribe()
    })
  }
  ngOnInit(): void {
    this.update()
  }
  update(){
    if( this.tournament.creatorUid == this.auth.getUserUid() ){
      this.isAdmin = true
    }
    let unsubscribe = this.firebaseFullService.onsnapShotDoc( [TournamentCollection.collectionName, this.tournamentId
      , PerformanceCollection.collectionName].join("/"), this.performanceId, {
        'next':(doc: DocumentSnapshot<DocumentData>) =>{
            this.performance = doc.data() as PerformanceObj
        },
        'error':(reason) =>{
          alert("there has been an error reading performances:" + reason)
        },
        'complete':() =>{
          console.log("reading program as ended")
      }
    })
    this.unsubscribers.push( unsubscribe )   
    this.getEvaluationGrades()    
  }

  getEvaluationGrades(){

    let filter 
    if( this.isAdmin ){
      //use no filter
    }
    else{ //force a filter
      let currentEmail:string = this.auth.getUserEmail()!
      filter = where("jurorId", "==", currentEmail)
    }  
      let unsubscribe = this.firebaseFullService.onsnapShotCollection( [TournamentCollection.collectionName, this.tournamentId
                                        , PerformanceCollection.collectionName, this.performanceId
                                        , EvaluationGradeCollection.collectionName].join("/"),
        {
          'next':(snapshot: QuerySnapshot<DocumentData>) =>{
            this.evaluationGradesReferences.length = 0
            snapshot.docs.map( doc =>{
              let evaluationGrade = doc.data() as EvaluationGradeObj
              let obj:EvaluationGradeReference = {
                id:doc.id,
                evaluationGrade:evaluationGrade
              }
              this.evaluationGradesReferences.push(obj)
            })
          },
          'error':(reason) =>{
            alert("there has been an error reading performances:" + reason)
          },
          'complete':() =>{
            console.log("reading program as ended")
        }
      },
      filter)
      this.unsubscribers.push( unsubscribe )                                        

  }  

  getEvaluationRefence( evaluationId:string, jurorId:string ):EvaluationGradeReference[]{
    let idx = this.evaluationGradesReferences.findIndex( e => (e.evaluationGrade.evaluationId == evaluationId && e.evaluationGrade.jurorId==jurorId) )
    if( idx >=0 ){
      return [this.evaluationGradesReferences[idx]]
    }
    return []
  }
  onAddEvaluationGrade(evaluationId:string, email:string){
    let evaluationGrade:EvaluationGradeObj = {
      evaluationId: evaluationId,
      jurorId: email,
      isCompleted: false,
      aspectGrades: [],
      grade: 10,
      overwriteGrade: null
    }
    let evaluationIdx = this.tournament.evaluations.findIndex( e => e.id == evaluationId )

    

    this.tournament.evaluations[evaluationIdx].aspects.map( aspect =>{
      let aspectGrade:AspectGrade = {
        label: aspect.label,
        description: aspect.description ? aspect.description : "",
        grade: 1,
        overwriteGrade: null
      }
      evaluationGrade.aspectGrades.push( aspectGrade )
    })

    let newId = uuidv4()
    this.firebaseService.setDocument([TournamentCollection.collectionName,this.tournamentId
                                      ,PerformanceCollection.collectionName,this.performanceId
                                      ,EvaluationGradeCollection.collectionName].join("/"), newId, evaluationGrade).then( ()=>{
      console.log( "evaluation has been created")
    },
    reason =>{
      alert( "ERROR adding evaluationGrade:" + reason)
    })
  }

  onRemoveEvaluationGrade(evaluationId:string, jurorId:string){

    let idx = this.evaluationGradesReferences.findIndex( er=>{
      return er.evaluationGrade.evaluationId == evaluationId && er.evaluationGrade.jurorId == jurorId 
    })
      
    if( idx >= 0){
      this.firebaseService.deleteDocument( [TournamentCollection.collectionName,this.tournamentId
        ,PerformanceCollection.collectionName,this.performanceId
        ,EvaluationGradeCollection.collectionName].join("/"), this.evaluationGradesReferences[idx].id ).then( ()=>{
        console.log("evaluationGrade has been deleted")
      },
      reason =>{
        alert("ERROR removing evaluationGrade" + reason)
      })
    }
  }
  getJurors():Juror[]{
   
    if( this.isAdmin ){
      
      return this.tournament.jurors.sort( (a,b)=>( a.label > b.label ? 1:-1))
    }
    else{
      let idx = this.tournament.jurors.findIndex( e => e.email == this.auth.getUserEmail())
      if( idx >=0 ){
        let jurorId = this.tournament.jurors[idx].id
        return this.tournament.jurors.filter( j => j.id == jurorId )
      }      
    }
    return []
  }
}
