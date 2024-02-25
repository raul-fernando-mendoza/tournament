import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { AuthService } from './auth.service';
import { Observable, Subject } from 'rxjs';

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
    localStorage.setItem('profile', JSON.stringify(profile) ) 
    this.profileSubject.next( this.profile )
  }
  getStoredItem( id:string):string | null{
    let valueStr:string | null = null
    try {
      valueStr = localStorage.getItem(id)
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

}
