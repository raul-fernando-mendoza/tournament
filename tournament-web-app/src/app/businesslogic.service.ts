import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { AuthService } from './auth.service';
import { Observable, Subject } from 'rxjs';
import { TournamentObj, Performance} from './types';
import { TournamentListComponent } from './tournament-list/tournament-list.component';

export type Profile = "participant" | "juror" | "organizer" | null

@Injectable({
  providedIn: 'root'
})
export class BusinesslogicService {

  profile: Profile = null
  private profileSubject : Subject<Profile> = new Subject<Profile >();

  constructor(private firebaseService:FirebaseService
    ,private authService:AuthService) { 

  }

  setCurrentProfile(profile:Profile){
    this.profile = profile
    if (typeof window !== 'undefined') {
      localStorage.setItem('profile', JSON.stringify(profile) ) 
    }
    this.profileSubject.next( this.profile )
  }

  setStoredItem(id:string, value:string){
    if (typeof window !== 'undefined') {
      localStorage.setItem(id, value ) 
    }
    this.profileSubject.next( this.profile )
  }  
  getStoredItem( id:string):string | null{
    let valueStr:string | null = null
    try {
      if (typeof window !== 'undefined') {
        valueStr = localStorage.getItem(id)
      }
    }
    catch( e ){
      console.log("error reading value from disk:" + id + " " + e)
    }
    return valueStr 
  } 

  getProfile(){
    if( this.profile == null ){
      let profileStr = this.getStoredItem("profile")
      if( profileStr && profileStr == "participant" ||  profileStr == "juror" || profileStr == "organizer" ){
        this.profile = profileStr
      }
      else{
        this.profile = "participant"
      }
    }
    return this.profile
  }
  getProfileName():string{
    let profile = this.getProfile()
    let str = ""
    switch( profile ){
      case "participant": str = "Participante"; break
      case "juror": str = "Jurado"; break
      case "organizer": str = "Organizador"; break
    }
    return str
  }

  onProfileChangeEvent(): Observable<any> {
    return this.profileSubject;
  }   

  isSetupCompleted(tournament:TournamentObj):boolean {
    let isSetupCompleted:boolean = false
    if( tournament.categories.length > 0 &&
      tournament.evaluations.length > 0 &&
      tournament.jurors.length > 0 &&
      tournament.medals.length > 0 )
    {
      isSetupCompleted = true
    }
    return isSetupCompleted
  }

  

}
