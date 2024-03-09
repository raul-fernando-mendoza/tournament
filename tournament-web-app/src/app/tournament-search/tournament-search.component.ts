import { AfterViewInit, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule} from '@angular/material/form-field';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input'; 
import {MatCardModule} from '@angular/material/card'; 
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FirebaseService } from '../firebase.service';
import { AuthService } from '../auth.service';
import { Router, RouterModule } from '@angular/router';
import { TournamentCollection, TournamentObj } from '../types';
import { PathService } from '../path.service';
import { BusinesslogicService, Profile } from '../businesslogic.service';

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
    ,MatButtonModule
    ,MatTooltipModule
    ,RouterModule
    ,MatCardModule
  ],
  templateUrl: './tournament-search.component.html',
  styleUrl: './tournament-search.component.css'
})
export class TournamentSearchComponent implements OnInit, AfterViewInit{

  

  searchForm = this.fb.group({
    search: [null],
  });

  tournamentList:Array<any> = []
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
    var tag:string = this.searchForm.controls.search.value ? this.searchForm.controls.search.value : ""

    let uid = null
    if( this.currentProfile == 'organizer' ) {
      uid = this.authService.getUserUid()
    }

    this.tournamentList.length = 0
    this.firebaseService.getCollectionByTag(TournamentCollection.collectionName, tag, uid).then( set =>{
      console.log(set)
      
      set.map( e =>{
        let t:TournamentObj = e.data() as TournamentObj
        if( this.currentProfile == 'organizer' ) {
          if( t.creatorUid == this.authService.getUserUid() ){
            this.tournamentList.push(e)
          }
        }
        
        else if( this.currentProfile == 'juror' ){
          
          let currentEmail = this.authService.getUserEmail()
          if( currentEmail ){
            if(  t.jurors.findIndex( juror => juror.email == currentEmail ) >= 0){
              this.tournamentList.push(e)
            }    
          }
        }
        
        else{
          this.tournamentList.push(e)
        }
      })
      
    },
    reason=>{
      alert("Error onSearch:" + reason)
    })
  }
  isLoggedIn(){
    return this.authService.isloggedIn()
  }

  parentCollection = ""
  isReadOnly = new Promise<boolean>((resolve, reject)=>{
    let collection=this.parentCollection[0]
    let id=this.parentCollection[1]
    console.log("isReadonly called")
    this.authService.isloggedIn()
  }) 

  onCreateTournament(){
    if( this.authService.isloggedIn() ){
      this.router.navigate(['/tournamentNew'])
    }
    else{
      this.router.navigate(['/loginForm/tournamentNew'])
    }
  }    

}
