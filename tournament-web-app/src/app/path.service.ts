import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FirebaseService } from './firebase.service';
import { Tournament } from './types';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PathService {
  constructor( private firebaseService:FirebaseService
    , private authService:AuthService) { }

  getPreviousPath(parentCollection:string):string{
    //remove the last two path elements from the end
    var splitted = parentCollection.split("/")

    var newParent = ""
    for( let i = 0; i<splitted.length - 2; i++){
      if(i>0){
        newParent += "/"
      } 
      newParent += splitted[i]
    }
    //the the last two elements and use them as the new start 
    var reverse = parentCollection.split("/").reverse()
    var newUrl = '/' + reverse[1] + "/" + reverse[0] 
    newUrl += "/"  + encodeURIComponent(newParent)
    return newUrl
  } 
  
  getEncodedPath( path:string, id:string | null = null){
    if( id == null){
      return encodeURIComponent(path)
    }
    return encodeURIComponent(path + "/" + id)
  }
}
