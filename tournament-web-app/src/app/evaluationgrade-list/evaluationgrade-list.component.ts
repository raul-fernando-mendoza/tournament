import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseService } from '../firebase.service';
import { AspectGrade, Evaluation, EvaluationGradeCollection, EvaluationGradeObj, Juror,  Performance, PerformanceCollection, PerformanceObj, TournamentCollection, TournamentObj  } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule} from '@angular/material/grid-list';
import { RouterModule } from '@angular/router';
import { and, DocumentData, DocumentSnapshot, QueryFieldFilterConstraint, QuerySnapshot, Unsubscribe, where, WhereFilterOp } from 'firebase/firestore';
import { Filter, FirebaseFullService } from '../firebasefull.service';
import { AuthService } from '../auth.service';
import { release } from 'os';
import { BusinesslogicService } from '../businesslogic.service';

interface EvaluationGradeReference{
  id:string
  evaluationGrade:EvaluationGradeObj
}

interface JurorRow{
  p:Performance
  e:Evaluation
  e_index:number
  r:EvaluationGradeReference
  j:Juror
  j_index:number
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
export class EvaluationgradeListComponent implements OnDestroy, AfterViewInit {
  
  @Input() tournamentId!:string
  @Input() tournament!:TournamentObj
  @Input() performanceId!:string 
  @Input() performance!:PerformanceObj
  @Output()  noEvaluationsFound = new EventEmitter<boolean>();
  @Output()  newGradeAvailable = new EventEmitter<boolean>();


  evaluationGradesReferences:Array<EvaluationGradeReference> = []  

  isAdmin = false
  
  newGrade = 0.0
  isNewGradeAvailable = false

  unsubscribeEvaluationGrade:Unsubscribe | undefined = undefined

  constructor(
    private firebase:FirebaseFullService,
    private auth:AuthService,
    private business:BusinesslogicService
  ){

  }
  ngAfterViewInit(): void {
    if( this.tournament.creatorUid == this.auth.getUserUid() ){
      this.isAdmin = true
    }    
    this.update()
  }
  ngOnDestroy(): void {
    if(this.unsubscribeEvaluationGrade){
      this.unsubscribeEvaluationGrade()
    }
  }
  update(){
    if(this.unsubscribeEvaluationGrade){
      this.unsubscribeEvaluationGrade()
    }
   
      let filter 
      if( this.isAdmin == true ){
        //no filter
      }
      else{ //force a filter
        let juror = this.tournament.jurors.find( e => e.email == this.auth.getUserEmail())
        if( juror ){
          let id:string = juror.id
          filter = where("jurorId", "==", id)
        }       
      }     
      this.unsubscribeEvaluationGrade = this.firebase.onsnapShotCollection( [TournamentCollection.collectionName, this.tournamentId
                                        , PerformanceCollection.collectionName, this.performanceId
                                        , EvaluationGradeCollection.collectionName].join("/"),
        {
          'next':(snapshot: QuerySnapshot<DocumentData>) =>{
            this.evaluationGradesReferences.length = 0
  
            this.isNewGradeAvailable = false
            let sumGrade = 0
            let numGrades = 0
            this.newGrade = 0
            snapshot.docs.map( doc =>{
              let evaluationGrade = doc.data() as EvaluationGradeObj
              let obj:EvaluationGradeReference = {
                id:doc.id,
                evaluationGrade:evaluationGrade
              }
              this.evaluationGradesReferences.push(obj)
              if( evaluationGrade.isCompleted ){
                sumGrade += evaluationGrade.grade
                numGrades += 1
              }
            })
            if( this.evaluationGradesReferences.length == 0){
              this.noEvaluationsFound.emit( true )
            }
            else{
              this.noEvaluationsFound.emit( false )
            }
            if( numGrades > 0 ){
              this.newGrade = Number( (sumGrade / numGrades).toFixed(2) )
              if( this.performance.grade != this.newGrade ){
                this.isNewGradeAvailable = true
                this.newGradeAvailable.emit(true)
              }
              else{
                this.newGradeAvailable.emit(false)
              }
            }
            this.getJurorData()
          },
          'error':(reason) =>{
            alert("there has been an error reading performances:" + reason)
          },
          'complete':() =>{
            console.log("reading program as ended")
        }
      },
      filter)
 
    
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
    this.firebase.setDocument([TournamentCollection.collectionName,this.tournamentId
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
      this.firebase.deleteDocument( [TournamentCollection.collectionName,this.tournamentId
        ,PerformanceCollection.collectionName,this.performanceId
        ,EvaluationGradeCollection.collectionName].join("/"), this.evaluationGradesReferences[idx].id ).then( ()=>{
        console.log("evaluationGrade has been deleted")
      },
      reason =>{
        alert("ERROR removing evaluationGrade" + reason)
      })
    }
  }

  onRelease(){
    if( !confirm("La calificacion :" +  this.newGrade + " ya no podra ser modificada. Desea continuar.") ){
      return
    }         
    let obj:Performance = {
      grade:this.newGrade,
      isReleased:true
    }
    this.firebase.updateDocument( [TournamentCollection.collectionName, this.tournamentId,
                                          PerformanceCollection.collectionName].join("/"), this.performanceId, obj).then( ()=>{
      console.log("Performance release updated")
      this.isNewGradeAvailable = false
      this.newGradeAvailable.emit(false)
    },
    reason =>{
      alert("Error actualizando la liberacion")
    })
  }   
  
  getMedal( newGrade:number ):string{
    return this.business.getMedalForPerformance(this.tournament!, newGrade)
  }

  jurorTable:Array<JurorRow> = []

  getJurorData(){
    this.jurorTable.length = 0
    if( this.tournament && this.performance ){
      for( let e_index=0; e_index<this.tournament.evaluations.length; e_index++ ){
        let e = this.tournament.evaluations[e_index]
        for(let j_index=0; j_index<this.tournament.jurors.length; j_index++){
          let j = this.tournament.jurors[j_index]
          if( !this.isAdmin ){
            let references = this.getEvaluationRefence(e.id,j.id)
            for(let r of references){
              let row:JurorRow ={
                p: this.performance,
                e: e,
                e_index: e_index,
                r: r,
                j: j,
                j_index: j_index
              }
              this.jurorTable.push(row)
            }
          }
        }
      }
    }
  }
}
