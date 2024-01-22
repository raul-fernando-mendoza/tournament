import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { TournamentObj } from './types';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class BusinesslogicService {

  constructor(private firebaseService:FirebaseService
    ,private authService:AuthService) { }

  getIsAdmin(parentCollection:string):Promise<boolean>{
    let splitted = parentCollection.split("/")
    let mainCollection=splitted[0]
    let mainId=splitted[1]    
    return new Promise<boolean>((resolve, reject)=>{
      this.firebaseService.getDocument(mainCollection, mainId).then( data=>{
        var tournament = data as TournamentObj
        if( tournament.creatorUid == this.authService.getUserUid() ){
          resolve(true)
        }
        else{
          resolve(false)
        }
      })    
    })
  }  
}
