import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { onAuthStateChanged, updateCurrentUser } from 'firebase/auth';
import { auth } from '../../environments/environment';
import { AuthService } from '../auth.service';
import { BusinesslogicService } from '../businesslogic.service';
import { FirebaseFullService } from '../firebasefull.service';
import { JurorCollection, JurorObj, TournamentCollection, TournamentObj } from '../types';

interface JurorRef{
  id:string
  juror:JurorObj
}

@Component({
  selector: 'app-tournament-router',
  standalone: true,
  imports: [],
  templateUrl: './tournament-router.component.html',
  styleUrl: './tournament-router.component.css'
})
export class TournamentRouterComponent{
  
  tournamentId :string | null= null
  tournament:TournamentObj | null =null
  jurors:Array<JurorRef> = []
  displayName =""

  constructor( 
     private activatedRoute: ActivatedRoute
    ,private authService:AuthService
    ,private router: Router
    ,private firebase:FirebaseFullService  
    ,private bussiness:BusinesslogicService){

    var thiz = this  
    this.activatedRoute.paramMap.subscribe( {
      next(paramMap){
        thiz.tournamentId = null
        if( paramMap.get('tournamentId') )
          thiz.tournamentId = paramMap.get('tournamentId')
          thiz.bussiness.home = "/" + TournamentCollection.collectionName + "/" + thiz.tournamentId
          thiz.update()
        }
    })  
  }
  update(){
    onAuthStateChanged( auth, (user) => {
      this.route()
    })      
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
            this.loadJurors().then( ()=>{
              let email = this.authService.getUserEmail() 
              let juror = this.jurors.find( e => e.juror.email == email)
              if( juror ){
                this.router.navigate(["/tournamentJuror/",this.tournamentId])  
              }
              else{
                this.router.navigate(["/tournamentParticipant/",this.tournamentId])  
              }
            })
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
  loadJurors():Promise<void>{
    return new Promise<void>( (resolve,reject) =>{
      if( this.tournamentId != null){
        this.firebase.getDocuments( [TournamentCollection.collectionName, this.tournamentId,
        JurorCollection.collectionName ].join("/") ).then( (set)=>{
              this.jurors.length = 0
              set.forEach( doc =>{
                let juror = doc.data() as JurorObj
                let jurorRef:JurorRef={
                  id: doc.id,
                  juror: juror
                }
                this.jurors.push( jurorRef )
              })
              this.jurors.sort( (a,b) => a.juror.label > b.juror.label ? 1:-1)
              resolve()
          },
          (reason)=>{
            alert("Error reading jurors:" + reason)
            reject(reason)
          } 
        )
        
      }
    })
  }


}
