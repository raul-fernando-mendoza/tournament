import { AfterViewInit, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule} from '@angular/material/form-field';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input'; 
import {MatCardModule} from '@angular/material/card'; 
import { TournamentComponent } from '../event/tournament.component';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FirebaseService } from '../firebase.service';
import { AuthService } from '../auth.service';
import { RouterModule } from '@angular/router';
import { TournamentCollection, TournamentObj } from '../types';
import { PathService } from '../path.service';

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
  ],
  templateUrl: './tournament-search.component.html',
  styleUrl: './tournament-search.component.css'
})
export class TournamentSearchComponent implements AfterViewInit{

  

  searchForm = this.fb.group({
    search: [null],
  });

  tournamentList:Array<any> = []
  
  constructor( private fb:FormBuilder,
    private firebaseService:FirebaseService,
    private authService:AuthService,
    public pathService:PathService){

  }
  ngAfterViewInit(): void {
    this.onSearch()
  }
  onSearch(){
    console.log( this.searchForm.controls.search.value )
    var tag:string = this.searchForm.controls.search.value ? this.searchForm.controls.search.value : ""
    this.tournamentList.length = 0
    this.firebaseService.getCollectionByTag(TournamentCollection.collectionName, tag).then( data =>{
      console.log(data)
      data.map( e =>{
        this.tournamentList.push(e)
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
}
