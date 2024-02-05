import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseService } from '../firebase.service';
import { AspectGrade, EvaluationGradeCollection, EvaluationGradeObj, Performance, PerformanceCollection, PerformanceObj, TournamentCollection, TournamentObj  } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule} from '@angular/material/grid-list';
import { RouterModule } from '@angular/router';
import { DocumentData, DocumentSnapshot, QuerySnapshot, Unsubscribe } from 'firebase/firestore';
import { FirebaseFullService } from '../firebasefull.service';

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

  constructor(
    private firebaseService:FirebaseService,
    private firebaseFullService:FirebaseFullService 
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
          this.recalculateGrade()
        },
        'error':(reason) =>{
          alert("there has been an error reading performances:" + reason)
        },
        'complete':() =>{
          console.log("reading program as ended")
      }
    })
    this.unsubscribers.push( unsubscribe )                                        
  }  

  getEvaluationRefence( evaluationId:string, jurorId:string ):EvaluationGradeReference|null{
    let idx = this.evaluationGradesReferences.findIndex( e => (e.evaluationGrade.evaluationId == evaluationId && e.evaluationGrade.jurorId==jurorId) )
    if( idx >=0 ){
      return this.evaluationGradesReferences[idx]
    }
    return null
  }
  onAddEvaluationGrade(evaluationId:string, jurorId:string){
    let evaluationGrade:EvaluationGradeObj = {
      evaluationId: evaluationId,
      jurorId: jurorId,
      isCompleted: false,
      aspectGrades: [],
      grade: 10,
      overwriteGrade: null
    }
    let evaluationIdx = this.tournament.evaluations.findIndex( e => e.id == evaluationId )
    let jurorIdx = this.tournament.jurors.findIndex( e => e.id == jurorId)

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
      this.update()
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
  onEditEvaluationGrade(evaluationId:string, jurorId:string){


    let idx = this.evaluationGradesReferences.findIndex( er=>{
      return er.evaluationGrade.evaluationId == evaluationId && er.evaluationGrade.jurorId == jurorId 
    })
      
    if( idx >= 0){
    }
  }  
  recalculateGrade(){
    let total = 0
    let cnt = 0
    this.evaluationGradesReferences.map( ref =>{
      if( ref.evaluationGrade.isCompleted ){
        total += ref.evaluationGrade.grade
        cnt += 1
      }
    })
    if( cnt > 0 ){
      let newGrade = Number((total/cnt).toFixed(1))
      if( this.performance.grade != newGrade ){
        let obj:Performance = {
          grade:newGrade
        }
        this.firebaseService.updateDocument( [TournamentCollection.collectionName, this.tournamentId,
                                              PerformanceCollection.collectionName].join("/"), this.performanceId, obj ).then( ()=>{
          console.log("performance updated")
        },
        reason=>{
          alert("Error updating performance:" + reason)
        })
      }
    }
  }
/*
  getEvaluationGrades(){
    this.evaluationGradesReferences.length = 0
    this.firebaseService.getDocuments( [TournamentCollection.collectionName, this.tournamentId
                                      , PerformanceCollection.collectionName, this.performanceId
                                      , EvaluationGradeCollection.collectionName].join("/") ).then( set =>{
      set.map( doc =>{
        let eg = doc.data() as EvaluationGradeObj
        let obj:EvaluationGradeReference = {
          id:doc.id,
          evaluationGrade:eg
        }
        this.evaluationGradesReferences.push(obj)
      })

  }
/*
  getEvaluations():Promise<void>{
    return new Promise<void>((resolve, reject) =>{
      this.evaluationReferences.length = 0
      this.firebaseService.getDocuments([TournamentCollection.collectionName,this.tournamentId
                                        ,EvaluationCollection.collectionName].join("/") ).then( set =>{
        set.map( doc =>{
          let evaluation = doc.data() as EvaluationObj
          let obj:EvaluationReference = {
            id:doc.id,
            evaluation:evaluation
          }
          this.evaluationReferences.push(obj)
        })
        resolve()
      },
      reason =>{
        alert("Error reading evaluations:" + reason)
        reject()
      })
    })
  }  

  getEvaluators():Promise<void>{
    return new Promise<void>((resolve, reject) =>{
      this.jurorReferences.length = 0
      this.firebaseService.getDocuments( [TournamentCollection.collectionName,this.tournamentId
                                          ,EvaluatorCollection.collectionName].join("/") ).then( set =>{
        set.map( doc =>{
          let evaluator = doc.data() as EvaluatorObj
          let obj = {
            id:doc.id,
            evaluator:evaluator
          }
          this.jurorReferences.push(obj)
        })
        resolve()
      },
      reason =>{
        alert("Error reading evaluators:" + reason)
        reject()
      })
    })

  }

  onAddEvaluationGrade(evaluationId:string, evaluatorId:string){
    let evaluationGrade:EvaluationGradeObj = {
      evaluationId: evaluationId,
      evaluatorId: evaluatorId,
      isCompleted: false,
      aspectGrades: [],
      grade: 10,
      overwriteGrade: null
    }
    
    
    //get all the aspects from evaluation and add them to the aspects
    this.firebaseService.getDocuments( TournamentCollection.collectionName + "/" + this.tournamentId + "/" + EvaluationCollection.collectionName + "/" + evaluationId + "/" + AspectCollection.collectionName).then( set =>{
      set.map( doc =>{
        let aspect = doc.data() as AspectObj
        let aspectGrade:AspectGrade = {
          label: aspect.label,
          description: aspect.description,
          grade: 1,
          overwriteGrade: null
        }
        evaluationGrade.aspectGrades.push( aspectGrade )
      })
    },reason =>{
      alert("ERROR retriving evaluation" + reason)
    }).then( () =>{
      let newId = uuidv4()
      this.firebaseService.setDocument([TournamentCollection.collectionName,this.tournamentId
                                        ,PerformanceCollection.collectionName,this.performanceId
                                        ,EvaluationGradeCollection.collectionName].join("/"), newId, evaluationGrade).then( ()=>{
        console.log( "evaluation has been created")
        this.update()
      },
      reason =>{
        alert( "ERROR adding evaluationGrade:" + reason)
      })
    })
  }
  onRemoveEvaluationGrade(evaluationId:string, evaluatorId:string){


    let idx = this.evaluationGradesReferences.findIndex( er=>{
      return er.evaluationGrade.evaluationId == evaluationId && er.evaluationGrade.evaluatorId == evaluatorId 
    })
      
    if( idx >= 0){
      this.firebaseService.deleteDocument( [TournamentCollection.collectionName,this.tournamentId
        ,PerformanceCollection.collectionName,this.performanceId
        ,EvaluationGradeCollection.collectionName].join("/"), this.evaluationGradesReferences[idx].id ).then( ()=>{
        console.log("evaluationGrade has been deleted")
        this.update()
      },
      reason =>{
        alert("ERROR removing evaluationGrade" + reason)
      })
    }
  }
  getEvaluationGradesFor(evaluationId:string, evaluatorId:string):EvaluationGradeReference[]{
    let result:Array<EvaluationGradeReference> = this.evaluationGradesReferences.filter( er=> er.evaluationGrade.evaluationId == evaluationId && er.evaluationGrade.evaluatorId == evaluatorId)
    return result
  }
*/
}
