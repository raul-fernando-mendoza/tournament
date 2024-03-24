import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { QuillModule } from 'ngx-quill';
import { FirebaseService } from '../firebase.service';
import { Juror, Tournament, TournamentCollection, TournamentObj } from '../types';

@Component({
  selector: 'app-juror-edit',
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
  templateUrl: './juror-edit.component.html',
  styleUrl: './juror-edit.component.css'
})
export class JurorEditComponent {
  tournamentId!:string
  jurorId!:string

  tournament:TournamentObj | null = null
  juror:Juror | null = null 

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
          let JurorId = paramMap.get('jurorId')
          if( tournamentId!=null && JurorId ){
            thiz.tournamentId = tournamentId
            thiz.jurorId = JurorId
            thiz.update()
          }
        }
      })
  }
  update(){
    this.firebaseService.getDocument( TournamentCollection.collectionName, this.tournamentId).then( (data)=>{
      
      this.tournament = data as TournamentObj
      
      let juror = this.tournament.jurors.find( e => e.id == this.jurorId)
      if( juror ){
        this.juror = juror
        this.form.controls.label.setValue( juror.label )
        this.form.controls.email.setValue( juror.email )
      }
    },
    reason =>{
      alert("Error leyendo categoria")
    })    
  }

  onSubmit(){
    let label = this.form.controls.label.value
    let email = this.form.controls.email.value
    if( this.tournament && this.juror && label && email){
      this.juror.label = label
      this.juror.email = email 
      let obj:Tournament = {
        jurors:this.tournament.jurors
      }        
     
      this.firebaseService.updateDocument( TournamentCollection.collectionName, this.tournamentId, obj).then( ()=>{
        console.log("jurado ha sido modificado")
        this.router.navigate(['../../'], { relativeTo: this.activatedRoute })

      },
      reason =>{
        alert("Error modificando jurado")
      })       
    }
    
  }
  onDelete(){
    if( !confirm("Esta seguro de querer borrar:" +  this.juror!.label) ){
      return
    }          
    let index = this.tournament!.jurors.findIndex( e => e.id == this.jurorId)
    if( index >= 0 ){
      this.tournament!.jurors.splice( index, 1)
      this.tournament!.jurorEmails = []
      this.tournament!.jurors.map( e =>
        this.tournament!.jurorEmails.push( e.email )
      )       
      let obj:Tournament = {
        jurors:this.tournament!.jurors,
        jurorEmails:this.tournament!.jurorEmails
      }        
     
      this.firebaseService.updateDocument( TournamentCollection.collectionName, this.tournamentId, obj).then( ()=>{
        console.log("categoria ha sido modificada")
        this.router.navigate(['../../'], { relativeTo: this.activatedRoute })

      },
      reason =>{
        alert("Error modificando categoria")
      })       
    }    

  }
}

