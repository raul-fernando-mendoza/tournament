import { CommonModule, ViewportScroller } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Route, Router, RouterModule } from '@angular/router';
import { QuillModule } from 'ngx-quill';
import { FirebaseService } from '../firebase.service';
import { Medal, Tournament, TournamentCollection, TournamentObj } from '../types';
import {MatGridListModule} from '@angular/material/grid-list';
import { MatSelectModule } from '@angular/material/select';
import { BusinesslogicService } from '../businesslogic.service';

@Component({
  selector: 'app-medal-edit',
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
    ,MatCardModule
    ,QuillModule
    ,MatGridListModule  
    ,MatSelectModule          
  ],
  templateUrl: './medal-edit.component.html',
  styleUrl: './medal-edit.component.css'
})
export class MedalEditComponent {

  tournamentId!:string
  medalId!:string

  tournament:TournamentObj | null = null
  medal:Medal |null = null

  form = this.fb.group({
    id:[null],
    label:['',Validators.required],
    description:[''],
    minGrade:['',[Validators.required, Validators.min(0), Validators.max(10)]]
  })  

  minGrades:Array<Number> = []
  
  constructor( public firebaseService:FirebaseService 
    ,private fb:FormBuilder
    ,private activatedRoute: ActivatedRoute     
    ,private router:Router
    ,private bussiness:BusinesslogicService    
  ){
    var thiz = this
    this.activatedRoute.paramMap.subscribe({
        next(paramMap){
          let tournamentId = paramMap.get('tournamentId')
          let medalId = paramMap.get('medalId')
          if( tournamentId!=null && medalId!=null){
            thiz.tournamentId = tournamentId
            thiz.medalId = medalId
            thiz.update()
          }
        }
      })
      this.minGrades=this.bussiness.getMinGrades()  
  }
  update(){
    this.firebaseService.getDocument( TournamentCollection.collectionName, this.tournamentId).then( (data)=>{
      this.tournament = data 
      this.tournament = data as TournamentObj
      
      let medal = this.tournament.medals.find( e => e.id == this.medalId)
      if( medal ){
        this.medal = medal
        this.form.controls.label.setValue( medal.label )
        this.form.controls.description.setValue( medal.description )
        this.form.controls.minGrade.setValue( medal.minGrade.toFixed(1) )
      }      
    },
    reason =>{
      alert("Error updating category")
    })    
  }

  onSubmit(){
    let label = this.form.controls.label.value
    let description = this.form.controls.description.value
    let minGrade = this.form.controls.minGrade.value
    if( this.tournament && this.medal && label ){
      this.medal.label = label
      this.medal.description = description ? description : ""
      this.medal.minGrade = Number(minGrade)
      let obj:Tournament = {
        medals:this.tournament.medals
      }        
     
      this.firebaseService.updateDocument( TournamentCollection.collectionName, this.tournamentId, obj).then( ()=>{
        console.log("premio ha sido modificado")
        this.router.navigate(['../../'], { relativeTo: this.activatedRoute })

      },
      reason =>{
        alert("Error modificando premio")
      })       
    }
    
  }
  onDelete(){
    if( !confirm("Esta seguro de querer borrar:" +  this.medal!.label) ){
      return
    }          
    let index = this.tournament!.medals.findIndex( e => e.id == this.medalId)
    if( index >= 0 ){
      this.tournament!.medals.splice( index, 1)
      let obj:Tournament = {
        medals:this.tournament!.medals
      }        
     
      this.firebaseService.updateDocument( TournamentCollection.collectionName, this.tournamentId, obj).then( ()=>{
        console.log("premio ha sido borrado")
        this.router.navigate(['../../'], { relativeTo: this.activatedRoute })

      },
      reason =>{
        alert("Error borrando premio")
      })       
    }    

  }

}
