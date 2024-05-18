import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { FirebaseService , Filter} from '../firebase.service';
import { TournamentCollection, TournamentObj } from '../types';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { DateFormatService } from '../date-format.service';
import { BusinesslogicService } from '../businesslogic.service';

interface TournamentLink{
  id:string,
  tournament:TournamentObj 
  isSetupCompleted:boolean
}

@Component({
  selector: 'app-tournament-admin-welcome',
  standalone: true,
  imports: [
    CommonModule
    ,MatIconModule
    ,MatButtonModule      
    ,MatProgressBarModule
    ,RouterModule  
    ,MatCardModule  
  ],
  templateUrl: './admin-welcome.component.html',
  styleUrl: './admin-welcome.component.css'
})
export class AdminTournamentWelcomeComponent implements OnInit{

  tournamentLinks:Array<TournamentLink> | null = null
 
  constructor(
    private firebase:FirebaseService,
    private auth:AuthService,
    public dateSrv:DateFormatService,
    private bussiness:BusinesslogicService,
    private router:Router
  ){
    this.bussiness.home = "/"

  }
  ngOnInit(): void {
    if( this.auth.isloggedIn() ){
      this.update()
    }
  }

  update(){
    let uid = this.auth.getUserUid()
    let filter:Array<Filter> = [
      {
        field:"creatorUid",
        operator:"==",
        value:uid
      }
    ]
    this.firebase.getDocuments(TournamentCollection.collectionName,filter).then( set =>{
      this.tournamentLinks = []
      set.map( e => {
        let tournament:TournamentObj = e.data() as TournamentObj
        let tl:TournamentLink ={
          id: e.id,
          tournament: tournament,
          isSetupCompleted: this.bussiness.isSetupCompleted(tournament)
        }
        this.tournamentLinks!.push(tl)
      })
    },
    reason=>{
      alert("Error reading list of tournaments")
    })
  }
}
