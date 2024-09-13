import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { BusinesslogicService } from '../businesslogic.service';
import { FirebaseFullService } from '../firebasefull.service';
import { TournamentCollection, TournamentObj } from '../types';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';


@Component({
  selector: 'app-tournament-router',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  templateUrl: './tournament-router.component.html',
  styleUrl: './tournament-router.component.css'
})
export class TournamentRouterComponent{
  
  tournamentId :string | null= null
  tournament:TournamentObj | null =null
  displayName =""

  constructor( 
     private activatedRoute: ActivatedRoute
    ,private authService:AuthService
    ,private router: Router
    ,private firebase:FirebaseFullService  
    ,private bussiness:BusinesslogicService){

    var thiz = this  
    this.activatedRoute.paramMap.subscribe( 
      paramMap =>{
        thiz.tournamentId = null
        if( paramMap.get('tournamentId') ){
          thiz.tournamentId = paramMap.get('tournamentId')
          thiz.update()
        }
        else{
          thiz.update()
        }
      }
    )  
  }
  update(){
    this.route()
  }

  route(){
    if( !this.authService.isloggedIn() ){
      this.router.navigate(["/tournamentGuess/",this.tournamentId])
    }
    else{
      this.loadTournament().then( ()=>{
        if( this.tournament ){
          if( this.tournament.creatorUid == this.authService.getUserUid() ){
            this.router.navigate(["/tournamentAdmin/",this.tournamentId])  
          }
          else{
              let email = this.authService.getUserEmail() 
              let juror = this.tournament.jurors.find( j => j.email == email)
              if( juror ){
                this.router.navigate(["/tournamentJuror/",this.tournamentId])  
              }
              else{
                this.router.navigate(["/tournamentParticipant/",this.tournamentId])  
              }
          }
        }  
      })

    }
  }
  loadTournament():Promise<void>{
    return new Promise<void>( (resolve,reject) =>{
      this.firebase.getDocument(TournamentCollection.collectionName,this.tournamentId).then( data =>{
        this.tournament = data as TournamentObj
        resolve()
      },
      reason =>{
        alert("Error leyendo tourneo:" + reason)
        reject(reason)
      })
    })
  }  


}
