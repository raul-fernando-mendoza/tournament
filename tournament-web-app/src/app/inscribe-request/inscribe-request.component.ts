import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FirebaseService } from '../firebase.service';
import { TournamentCollection, InscriptionRequestCollection, InscriptionRequest } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { AuthService } from '../auth.service';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { QuillModule } from 'ngx-quill'

@Component({
  selector: 'app-inscribe-request',
  standalone: true,
  imports: [
    CommonModule
    ,MatIconModule
    ,MatButtonModule      
    ,RouterModule
    ,MatCardModule
    ,QuillModule
    ,FormsModule
    ,ReactiveFormsModule
    ,MatFormFieldModule
  ],
  templateUrl: './inscribe-request.component.html',
  styleUrl: './inscribe-request.component.css'
})
export class InscribeRequestComponent implements OnInit{

  tournamentId:string | null = null

  currentEmail:string | null = null

  form = this.fb.group({
    description:[""]
  })  

  constructor(private firebase:FirebaseService
    ,private auth:AuthService
    ,private fb:FormBuilder
    ,private router:Router
    ,private activatedRoute: ActivatedRoute ){
    var thiz = this
    this.activatedRoute.paramMap.subscribe( {
      next(paramMap){
        thiz.tournamentId = null
        if( paramMap.get('tournamentId') )
          thiz.tournamentId = paramMap.get('tournamentId')
        }

      })    
  }
  ngOnInit(): void {
    this.update()
  }

  update(){
    this.currentEmail =  this.auth.getUserEmail()
  }
  onSubmit(){
    let id= uuidv4()
 
    let obj:InscriptionRequest = {
      email: this.currentEmail!,
      description: this.form.controls.description.value
    }
    this.firebase.setDocument( 
        [TournamentCollection.collectionName, this.tournamentId,InscriptionRequestCollection.collectionName].join("/"), id, obj ).then( ()=>{
          this.router.navigate(["participantTournament",this.tournamentId])
      },
      reason=>{
        alert("Error:creando la solicitud de inscripcion")
      })
  }
  onCancel(){
    this.router.navigate([TournamentCollection.collectionName,this.tournamentId])
  }


}
