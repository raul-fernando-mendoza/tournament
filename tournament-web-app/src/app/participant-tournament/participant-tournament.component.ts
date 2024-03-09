import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { Tournament, TournamentCollection, TournamentObj } from '../types';
import { FirebaseService,Filter } from '../firebase.service';

@Component({
  selector: 'app-participant-tournament',
  standalone: true,
  imports: [],
  templateUrl: './participant-tournament.component.html',
  styleUrl: './participant-tournament.component.css'
})
export class ParticipantTournamentComponent {

  tournamentId :string | null= null
  tournament:TournamentObj| null = null

  constructor(
    private auth:AuthService
    ,private router:Router
    ,public firebase:FirebaseService  ){
  }

  update(){

  }
    
  onInscribe(){
    if( !this.auth.isloggedIn() ){
      this.router.navigate(['/loginForm', encodeURI("tournament/" + this.tournamentId)])
    }
    else{
      this.addParticipant( this.auth.getUserEmail()! )
    }
  }
  addParticipant(email:string){
    if( this.tournament && this.tournament.participantEmails.findIndex( e => e == email) < 0){
      this.tournament.participantEmails.push( email )
      let t:Tournament ={
        participantEmails: this.tournament.participantEmails
      }
      this.firebase.updateDocument( TournamentCollection.collectionName, this.tournamentId, t).then( ()=>{
        this.update()
      },
      reason=>{
        alert("Error saving participant:" + reason)
      })
    }
  }   
}
