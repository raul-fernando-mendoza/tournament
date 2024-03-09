import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { FirebaseService , Filter} from '../firebase.service';
import { TournamentCollection, TournamentObj } from '../types';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';

interface TournamentLink{
  id:string,
  tournament:TournamentObj 
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
  templateUrl: './admin-tournament-welcome.component.html',
  styleUrl: './admin-tournament-welcome.component.css'
})
export class AdminTournamentWelcomeComponent implements OnInit{

  tournamentLinks:Array<TournamentLink> | null = null
 
  constructor(
    private firebase:FirebaseService,
    private auth:AuthService
  ){


  }
  ngOnInit(): void {
    this.update()
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
          id:e.id,
          tournament:tournament
        }
        this.tournamentLinks!.push(tl)
      })
    })
  }
}
