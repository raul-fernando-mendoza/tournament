import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule} from '@angular/material/list';
import { Router, RouterModule } from '@angular/router';
import {MatCardModule} from '@angular/material/card';
import {MatGridListModule} from '@angular/material/grid-list';
import { AuthService } from '../auth.service';
import { onAuthStateChanged, Unsubscribe, User } from "firebase/auth";
import { auth } from '../../environments/environment';
import { BusinesslogicService } from '../businesslogic.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule
    ,MatButtonModule     
    ,MatListModule
    ,RouterModule 
    ,MatCardModule   
    ,MatGridListModule
],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy{

  unsubscribe:Unsubscribe|null = null
  constructor(private authSrv:AuthService,
    private router: Router,
    private bussiness:BusinesslogicService,
    ){

  }
  ngOnDestroy(): void {
    if(this.unsubscribe){
      this.unsubscribe()
    }
  }
  ngOnInit(): void {
    this.unsubscribe = onAuthStateChanged( auth, (user) => {
      if( auth.currentUser ){
        console.log("login current user:" + auth.currentUser)
        this.router.navigate(["/tournamentAdmin"])
      }
    }) 
  }
  signInWithPopup() {
    //alert("going to call login with Login popup")
    this.authSrv.signInWithPopup().then( (User) =>{
      console.log("signed in completed")
    })
  } 
}
