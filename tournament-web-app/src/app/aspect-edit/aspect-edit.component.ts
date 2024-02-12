import { AfterViewInit, Component , OnDestroy} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Aspect, Evaluation, Tournament, TournamentCollection, TournamentObj } from '../types';
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
  selector: 'app-aspect-edit',
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
  templateUrl: './aspect-edit.component.html',
  styleUrl: './aspect-edit.component.css'
})
export class AspectEditComponent implements  OnDestroy{
  tournamentId!:string
  tournament!:TournamentObj
  evaluationId!:string 
  evaluation!:Evaluation
  aspectId:string | null = null
  aspect:Aspect | null = null

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
            let aspectId = paramMap.get('aspectId')
            if( aspectId != 'null' ){
              thiz.aspectId = aspectId 
            }
            if( tournamentId!=null && evaluationId!=null ){
              thiz.tournamentId = tournamentId
              thiz.evaluationId = evaluationId 
              thiz.update()
            }
          }
        })      
  
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
        let evaluationIdx = this.tournament.evaluations.findIndex( e => e.id == this.evaluationId )
        if( evaluationIdx>=0 ){
          this.evaluation = this.tournament.evaluations[evaluationIdx]
          
          let idx = this.evaluation.aspects.findIndex( e => e.id == this.aspectId)
          if( idx >= 0){ 
            this.aspect = this.evaluation.aspects[idx]
            this.form.controls.label.setValue( this.aspect.label)
            this.form.controls.description.setValue( this.aspect.description )
          }
        }
      }
    },
    reason =>{
      alert("Error reading aspect:" + reason)
    })    
  }

  onSave(){

    let label = this.form.controls.label.value!.trim()
    let description = this.form.controls.description.value!.trim()

    if( !this.aspect ){
      var id = uuidv4()
      let aspect:Aspect = {
        id: id,
        label: label,
        description: description,
      }
      this.evaluation.aspects.push( aspect )
    }
    else{
        this.aspect.label = label
        this.aspect.description = description
    }  
    
    let obj:Tournament = {
      evaluations:this.tournament.evaluations
    }
    this.firebase.updateDocument( TournamentCollection.collectionName, this.tournamentId, obj).then( ()=>{
      console.log("aspect list updated")
      this.router.navigate( [TournamentCollection.collectionName, this.tournamentId, 'evaluation', this.evaluationId])
    },
    reason =>{
      alert("Error updating aspect:" + reason)
    })      
  }
  onDelete(){
    if( this.aspectId != null ){
      let idx = this.evaluation.aspects.findIndex( e => e.id == this.aspectId)
      if( idx >=0 ){
        this.evaluation.aspects.splice(idx,1)
        let obj:Tournament = {
          evaluations:this.tournament.evaluations
        }
        this.firebase.updateDocument( TournamentCollection.collectionName, this.tournamentId, obj).then( ()=>{
          this.router.navigate( [TournamentCollection.collectionName, this.tournamentId, 'evaluation', this.evaluationId])
        },
        reason =>{
          alert("ERROR:removing aspect:" + reason)
        })    
      }
    }
  }
}
