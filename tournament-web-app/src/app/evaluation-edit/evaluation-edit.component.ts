import { AfterViewInit, Component , EventEmitter, Input, OnDestroy, Output} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Evaluation, Tournament, TournamentCollection, TournamentObj } from '../types';
import { AuthService } from '../auth.service';
import { FirebaseFullService } from '../firebasefull.service';
import { Unsubscribe } from 'firebase/firestore';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { v4 as uuidv4 } from 'uuid';
import { AspectListComponent } from '../aspect-list/aspect-list.component';

@Component({
  selector: 'app-evaluation-edit',
  standalone: true,
  imports: [CommonModule
    ,MatIconModule
    ,MatButtonModule      
    ,FormsModule
    ,ReactiveFormsModule
    ,MatFormFieldModule
    ,MatInputModule
    ,RouterModule
    ,MatCardModule
    ,AspectListComponent        
  ],
  templateUrl: './evaluation-edit.component.html',
  styleUrl: './evaluation-edit.component.css'
})
export class EvaluationEditComponent implements OnDestroy{
  tournamentId!:string
  tournament!:TournamentObj
  evaluationId:string | null = null
  evaluation:Evaluation | null = null

  isAdmin = false
  form = this.fb.group({
    id:[null],
    label:['',Validators.required],
    description:['',Validators.required]
  })

  unsubscribe:Unsubscribe | undefined = undefined

  constructor(private auth:AuthService,
    private firebase:FirebaseFullService,
    private activatedRoute: ActivatedRoute,
    private fb:FormBuilder,
    private router: Router ){
      var thiz = this
      this.activatedRoute.paramMap.subscribe({
          next(paramMap){
            let tournamentId = paramMap.get('tournamentId')
            let evaluationId = paramMap.get('evaluationId')
            if( evaluationId != 'null' ){
              thiz.evaluationId = evaluationId 
            }
            if( tournamentId!=null ){
              thiz.tournamentId = tournamentId
              thiz.update()
            }
          }
        })      
    if( this.auth.getUserUid()!= null && this.tournament?.creatorUid != null ){
      this.isAdmin = (this.auth.getUserUid() == this.tournament?.creatorUid) 
    }     
  }
  ngOnDestroy(): void {
    if( this.unsubscribe ){
      this.unsubscribe()
    }
  }

  update(){
    this.firebase.getDocument( TournamentCollection.collectionName, this.tournamentId).then( (data)=>{
      this.tournament = data 
      if( this.auth.getUserUid()!= null && this.tournament?.creatorUid != null ){
        this.isAdmin = (this.auth.getUserUid() == this.tournament?.creatorUid) 
      }   
      if( this.evaluationId ){ //if is editing and existing load the data from evaluation
        let idx = this.tournament.evaluations.findIndex( e => e.id == this.evaluationId )
        if( idx>=0 ){
          this.evaluation = this.tournament.evaluations[idx]
          this.form.controls.label.setValue( this.evaluation.label)
          this.form.controls.description.setValue( this.evaluation.description )
        }
      }
    },
    reason =>{
      alert("Error updating evaluations:" + reason)
    })    
  }

  onSave(){

    let label = this.form.controls.label.value!.trim()
    let description = this.form.controls.description.value!.trim()

    if( !this.evaluation ){
      var id = uuidv4()
      let evaluation:Evaluation = {
        id: id,
        label: label,
        description: description,
        aspects: []
      }
      this.evaluation = evaluation
      this.tournament.evaluations.push( evaluation )
    }
    else{
      var id = this.evaluation.id
      let idx = this.tournament.evaluations.findIndex( e => e.id == id)
      if( idx >= 0){
        this.tournament.evaluations[idx].label = label
        this.tournament.evaluations[idx].description = description
      }
    }  
    
    this.tournament.evaluations.sort( (a,b)=>{
      return a.label >= b.label ? 1 : -1
    }) 
    let obj:Tournament = {
      evaluations:this.tournament.evaluations
    }
    this.firebase.updateDocument( TournamentCollection.collectionName, this.tournamentId, obj).then( ()=>{
      console.log("evaluations list updated")
      this.router.navigate(['/',TournamentCollection.collectionName,this.tournamentId,'evaluation', this.evaluation!.id])
    },
    reason =>{
      alert("Error updating evaluations:" + reason)
    })      
  }
  onDelete(){
    let idx = this.tournament.evaluations.findIndex( e => e.id == this.evaluationId)
    if( idx >=0 ){
      this.tournament.evaluations.splice(idx,1)
      let obj:Tournament = {
        evaluations:this.tournament.evaluations
      }
      this.firebase.updateDocument( TournamentCollection.collectionName, this.tournamentId, obj).then( ()=>{
        this.router.navigate( [TournamentCollection.collectionName, this.tournamentId])
      },
      reason =>{
        alert("ERROR:removing evaluation:" + reason)
      })    
    }
  }
}
