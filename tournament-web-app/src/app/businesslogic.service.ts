import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { Medal, Performance, PerformanceObj, TournamentObj } from './types';
import { AuthService } from './auth.service';
import { MedalsListComponent } from './medals-list/medals-list.component';

@Injectable({
  providedIn: 'root'
})
export class BusinesslogicService {

  constructor(private firebaseService:FirebaseService
    ,private authService:AuthService) { }


}
