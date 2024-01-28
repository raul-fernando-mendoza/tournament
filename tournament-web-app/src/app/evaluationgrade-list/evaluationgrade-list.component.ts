import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseService } from '../firebase.service';
import {  AspectGrade,  EvaluationGradeCollection, EvaluationGradeObj, EvaluatorCollection, EvaluatorObj, PerformanceCollection, PerformanceObj, TournamentCollection } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule} from '@angular/material/grid-list';
import { RouterModule } from '@angular/router';

interface EvaluationGradeReference{
  id:string
  evaluationGrade:EvaluationGradeObj
}

interface EvaluatorReference{
  id:string
  evaluator:EvaluatorObj
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
export class EvaluationgradeListComponent implements OnInit {
  ngOnInit(): void {}
  /*
  @Input() tournamentId!:string
  @Input() performanceId!:string 

  performance:PerformanceObj | null = null
  evaluationGradesReferences:Array<EvaluationGradeReference> = []  
  evaluatorReferences:Array<EvaluatorReference> = []  
  evaluationReferences:Array<EvaluationReference> = []  

  constructor(
    public firebaseService:FirebaseService 
  ){

  }
  ngOnInit(): void {

    this.getEvaluators()
    this.getEvaluations()    
    this.update()
  }
  update(){
    this.getPerformance()
    this.getEvaluationGrades()    
  }
  getPerformance():Promise<void>{
    return this.firebaseService.getDocument( [TournamentCollection.collectionName, this.tournamentId,
    PerformanceCollection.collectionName].join("/"), this.performanceId).then( data =>{
      this.performance = data as PerformanceObj
    })
  }
  getEvaluationGrades():Promise<void>{
    return new Promise<void>((resolve, reject) =>{
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
        resolve()
      },
      reason =>{
        alert("Error reading categories:" + reason)
        reject()
      })
    })
  }

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
      this.evaluatorReferences.length = 0
      this.firebaseService.getDocuments( [TournamentCollection.collectionName,this.tournamentId
                                          ,EvaluatorCollection.collectionName].join("/") ).then( set =>{
        set.map( doc =>{
          let evaluator = doc.data() as EvaluatorObj
          let obj = {
            id:doc.id,
            evaluator:evaluator
          }
          this.evaluatorReferences.push(obj)
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
