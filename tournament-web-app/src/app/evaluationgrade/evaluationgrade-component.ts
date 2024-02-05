import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseService } from '../firebase.service';
import { EvaluationGradeObj, TournamentCollection, EvaluationGradeCollection, PerformanceCollection, PerformanceObj, EvaluationGrade, TournamentObj} from '../types'
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { FormBuilder, FormsModule, ReactiveFormsModule, Validators ,FormArray} from '@angular/forms';
import {MatCardModule} from '@angular/material/card';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { v4 as uuidv4 } from 'uuid';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { PathService } from '../path.service';
import { AuthService } from '../auth.service';
import {MatSelectModule} from '@angular/material/select';
import { BusinesslogicService } from '../businesslogic.service';
import { StarSliderComponent } from '../star-slider/star-slider.component';
import { DescriptionApplyDialog } from './description-apply-dlg';
import { MatDialog } from '@angular/material/dialog';
import { resolve } from 'path';

@Component({
  selector: 'app-evaluationgrade-component',
  standalone: true,
  imports: [
   CommonModule, 
   MatCardModule, 
   RouterModule,
   FormsModule,
   ReactiveFormsModule,
   MatFormFieldModule,
   MatInputModule,
   MatIconModule,
   MatButtonModule,
   MatSelectModule,
   StarSliderComponent,
   DescriptionApplyDialog
],
  templateUrl: './evaluationgrade-component.html',
  styleUrl: './evaluationgrade-component.css'
})
export class EvaluationGradeComponent implements OnInit{
  tournamentId!:string
  performanceId!:string 
  evaluationGradeId!:string

  tournament!:TournamentObj
  performance!:PerformanceObj
  evaluationGrade!:EvaluationGradeObj

  collection = EvaluationGradeCollection.collectionName
  submitting = false

  form = this.fb.group({
    evaluationId:['',Validators.required],
    evaluatorId:['',Validators.required],
    isCompleted:[false]
  })
  isAdmin:boolean=false
  isOwner:boolean=false

  evaluationGradeForm = this.fb.group({
    aspects:this.fb.array([]),
  })  
  
  constructor( public firebaseService:FirebaseService 
    ,private fb:FormBuilder
    ,private activatedRoute: ActivatedRoute    
    ,private router: Router
    ,public pathService: PathService
    ,private authService: AuthService 
    ,private bussinesslogicService:BusinesslogicService
    ,public dialog: MatDialog   
    ){
      var thiz = this
      this.activatedRoute.paramMap.subscribe({
          next(paramMap){
            let tournamentId = paramMap.get('tournamentId')
            let performanceId = paramMap.get('performanceId')
            let evaluationGradeId = paramMap.get('evaluationGradeId')
            if( tournamentId && performanceId && evaluationGradeId ){
              thiz.tournamentId = tournamentId
              thiz.performanceId = performanceId
              thiz.evaluationGradeId = evaluationGradeId
              thiz.update()
            }
          }
        })
  }
  ngOnInit(): void {
   
  }
  get aspects() {
    return this.evaluationGradeForm.get('aspects') as FormArray;
  } 
  addAspects() {
    this.aspects.push(this.fb.control(''));
  }   


  update(){
    this.firebaseService.getDocument( TournamentCollection.collectionName, this.tournamentId).then( data =>{
      this.tournament = data as TournamentObj
    },
    reason =>{
      alert("Error reading tournament:" + reason)
    })
    this.firebaseService.getDocument( [TournamentCollection.collectionName, this.tournamentId,
                                        PerformanceCollection.collectionName].join("/"), this.performanceId).then( data =>{
      this.performance = data as PerformanceObj                                          
    },
    reason =>{
      alert("error reading performance:" + reason)
    })
   
    this.firebaseService.getDocument(
      [TournamentCollection.collectionName,this.tournamentId
      ,PerformanceCollection.collectionName,this.performanceId
      ,EvaluationGradeCollection.collectionName].join("/"),
      this.evaluationGradeId).then( data =>{
        this.evaluationGrade = data as EvaluationGradeObj
        this.aspects.controls.length = 0
        this.evaluationGrade.aspectGrades.map( aspect =>{
          let newControl = this.fb.control([aspect.grade])
          if( this.performance.isReleased ){
            newControl.disable()
          }
          this.aspects.push(newControl);
        })
      },
      reason=>{
        alert("Error: reading evaluationGrade:" + reason )
    }) 
  }
  onCancel(){
    this.router.navigate(['/' + `${TournamentCollection.collectionName}/${this.tournamentId}/${PerformanceCollection.collectionName}/${this.performanceId}`])
  }

  onChangeStarts(idx:number){
    console.log( idx + " " + this.aspects.controls[idx].value )
    this.evaluationGrade.aspectGrades[idx].grade = this.aspects.controls[idx].value
    this.updateGrade()
  }
  showText(str:string|null){
    if( str == null){
      str ="N/A"
    }
    const dialogRef = this.dialog.open(DescriptionApplyDialog, {
      width: '250px',
      data: { description: str}
    });    
  }
  updateGrade() {
    let total = 0
    for(let i=0; i<this.evaluationGrade.aspectGrades.length; i++){
      total += this.evaluationGrade.aspectGrades[i].grade
    }
    this.evaluationGrade.grade = Number.parseFloat((10.0*(total/this.evaluationGrade.aspectGrades.length)).toFixed(2))
  }  
  onSubmit(){
    this.updateGrade()
    let obj:EvaluationGrade ={
      grade:this.evaluationGrade.grade,
      aspectGrades:this.evaluationGrade.aspectGrades,
      isCompleted:true
    }
    this.firebaseService.updateDocument( [TournamentCollection.collectionName,this.tournamentId
      ,PerformanceCollection.collectionName,this.performanceId
      ,EvaluationGradeCollection.collectionName].join("/"),
      this.evaluationGradeId, obj).then( () =>{
        this.router.navigate( ["/", TournamentCollection.collectionName, this.tournamentId,
                                    'program'])
      },
      reason=>{
        alert("ERROR salvando calificacion:" + reason)
      })
  } 
}
