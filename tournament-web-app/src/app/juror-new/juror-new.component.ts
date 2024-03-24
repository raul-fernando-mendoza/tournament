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
import { Juror, Tournament, TournamentCollection, TournamentObj } from '../types';
import { v4 as uuidv4, v4 } from 'uuid';

@Component({
  selector: 'app-juror-new',
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
  ],
  templateUrl: './juror-new.component.html',
  styleUrl: './juror-new.component.css'
})
export class JurorNewComponent {

  tournamentId!:string

  tournament:TournamentObj | null = null

  form = this.fb.group({
    label:["",Validators.required],
    email:["",[Validators.email,Validators.required]]
  })  
  
  constructor( public firebaseService:FirebaseService 
    ,private fb:FormBuilder
    ,private activatedRoute: ActivatedRoute     
    ,private router:Router
  ){
    var thiz = this
    this.activatedRoute.paramMap.subscribe({
        next(paramMap){
          let tournamentId = paramMap.get('tournamentId')
          if( tournamentId!=null ){
            thiz.tournamentId = tournamentId
            thiz.update()
          }
        }
      })
  }
  update(){
    this.firebaseService.getDocument( TournamentCollection.collectionName, this.tournamentId).then( (data)=>{
      this.tournament = data 
    },
    reason =>{
      alert("Error updating category")
    })    
  }

  onSubmit(){
    let label = this.form.controls.label.value
    let email = this.form.controls.email.value
    if( this.tournament && label && email){
      let juror:Juror={
        id: uuidv4(),
        label: label,
        email: email
      }
      this.tournament.jurors.push( juror )
      this.tournament.jurorEmails = []
      this.tournament.jurors.map( e =>
        this.tournament?.jurorEmails.push( e.email )
      ) 
      let obj:Tournament = {
        jurors:this.tournament.jurors,
        jurorEmails:this.tournament.jurorEmails
      }        
     
      this.firebaseService.updateDocument( TournamentCollection.collectionName, this.tournamentId, obj).then( ()=>{
        console.log("juror ha sido adicionada")
        this.router.navigate(['../'], { relativeTo: this.activatedRoute })

      },
      reason =>{
        alert("Error adicionando juror")
      })       
    }
    
  }


}
