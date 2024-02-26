import { AfterViewInit, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule} from '@angular/material/form-field';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input'; 
import {MatCardModule} from '@angular/material/card'; 
import { TournamentComponent } from '../tournament/tournament.component';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FirebaseService } from '../firebase.service';
import { AuthService } from '../auth.service';
import { Router, RouterModule } from '@angular/router';
import { TournamentCollection, TournamentObj } from '../types';
import { PathService } from '../path.service';
import { BusinesslogicService, Profile } from '../businesslogic.service';
import {MatListModule} from '@angular/material/list';


interface TournamentLink{
  id:string
  tournament:TournamentObj
}

@Component({
  selector: 'app-tournament-list',
  standalone: true,
  imports: [
    CommonModule
    ,MatFormFieldModule
    ,FormsModule
    ,MatIconModule
    ,MatInputModule
    ,ReactiveFormsModule
    ,MatFormFieldModule
    ,TournamentComponent
    ,MatButtonModule
    ,MatTooltipModule
    ,RouterModule
    ,MatCardModule
    ,MatListModule
  ],
  templateUrl: './tournament-list.component.html',
  styleUrl: './tournament-list.component.css'
})
export class TournamentListComponent implements OnInit, AfterViewInit{

  

  searchForm = this.fb.group({
    search: [null],
  });

  tournaments:Array<TournamentLink> = []
  currentProfile :Profile = null
  
  constructor( private fb:FormBuilder,
    private firebaseService:FirebaseService,
    private authService:AuthService,
    public pathService:PathService,
    private router: Router,
    private bussiness:BusinesslogicService
    ){

  }
  ngOnInit(): void {
    this.bussiness.onProfileChangeEvent().subscribe( profile =>{
      this.currentProfile = profile
      this.onSearch()
    })
    this.currentProfile = this.bussiness.getProfile()
  }
  ngAfterViewInit(): void {
    this.onSearch()
  }
  onSearch(){
    console.log( this.searchForm.controls.search.value )
    let uid = this.authService.getUserUid()
    var tag:string = this.searchForm.controls.search.value ? this.searchForm.controls.search.value : ""
    this.tournaments.length = 0
    this.firebaseService.getCollectionByTag(TournamentCollection.collectionName, tag, uid).then( set =>{
      console.log(set)
      
      set.map( e =>{
        let t:TournamentObj = e.data() as TournamentObj
        let tl:TournamentLink = {
          id:e.id,
          tournament:t
        }
        this.tournaments.push(tl)
      })
    },
    reason=>{
      alert("Error onSearch:" + reason)
    })
  }
  isLoggedIn(){
    return this.authService.isloggedIn()
  }

  onCreateTournament(){
    if( this.authService.isloggedIn() ){
      this.router.navigate(['/tournamentNew'])
    }
  }    

  onShowAll(){
    this.searchForm.controls.search.setValue(null)
    this.onSearch()
  }


}
