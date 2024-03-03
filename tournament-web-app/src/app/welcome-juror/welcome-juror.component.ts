import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { FirebaseService } from '../firebase.service';
import { FirebaseFullService } from '../firebasefull.service';
import { Filter, Tournament, TournamentCollection } from '../types';

interface TournamentLink{
  id:string
  tournament:Tournament
}

@Component({
  selector: 'app-welcome-juror',
  standalone: true,
  imports: [],
  templateUrl: './welcome-juror.component.html',
  styleUrl: './welcome-juror.component.css'
})
export class WelcomeJurorComponent implements OnInit{

  tournamentList:TournamentLink[] = []

  constructor(
    private auth:AuthService,
    private firebase:FirebaseFullService,
    private router:Router

  ){

  }

  ngOnInit(): void {
    //get all the tournaments where I am a juror
    this.update()    
  }
  update(){

    let email:string | null = this.auth.getUserEmail()
    if( email ){
      let filter:Filter[] = [{
        field:"jurors",
        operator:"array-contains",
        value:email
      },
      {
        field:"active",
        operator:"==",
        value:true
      }]
      this.firebase.getDocuments( TournamentCollection.collectionName, filter).then( set =>{
        this.tournamentList.length = 0
        set.map( doc =>{
          let tournament = doc.data() as Tournament 
          let tournamentLink:TournamentLink = {
            id: doc.id,
            tournament:tournament
          } 
          this.tournamentList.push(tournamentLink)
        })        
      })  
    }
  }

}
