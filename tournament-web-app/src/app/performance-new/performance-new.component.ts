import { Component } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';
import { FirebaseService } from '../firebase.service';
import { PerformanceCollection, PerformanceObj, TournamentCollection, TournamentObj } from '../types';
import { v4 as uuidv4, v4 } from 'uuid';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-performance-new',
  standalone: true,
  imports: [
    CommonModule
    ,MatIconModule
    ,MatButtonModule      
    ,FormsModule
    ,ReactiveFormsModule
    ,MatFormFieldModule
    ,MatInputModule
    ,RouterModule
    ,MatCardModule 
    ,MatSelectModule       
  ],
  templateUrl: './performance-new.component.html',
  styleUrl: './performance-new.component.css'
})
export class PerformanceNewComponent {

  tournamentId:string|null = null
  tournament:TournamentObj|null = null

  g = this.fb.group({
    id:[null],
    label:[""],
    categoryId:["",Validators.required],
    fullname:["",Validators.required],
    academy:[""],
    coreographer:[""],
    city:[""]
  })

  constructor(
    private activatedRoute: ActivatedRoute
    ,private auth:AuthService
    ,private router:Router
    ,private firebase:FirebaseService 
    ,private fb:FormBuilder
    ){
      var thiz = this
      this.activatedRoute.paramMap.subscribe( {
        next(paramMap){
          let tournamentId = paramMap.get('tournamentId')
          if( tournamentId )
            thiz.tournamentId = tournamentId
            thiz.update()
          }
  
        })       
  }
    
  update(){
    if( this.tournamentId != null){
      this.firebase.getDocument( TournamentCollection.collectionName, this.tournamentId).then( data =>{
        this.tournament = data as TournamentObj
      })
    }
  }  

  onSubmit(){
    let label = this.g.controls.label.value
    let categoryId = this.g.controls.categoryId.value
    let fullname = this.g.controls.fullname.value
    let academy = this.g.controls.academy.value    
    let coreagrapher = this.g.controls.coreographer.value 
    let city = this.g.controls.city.value 
    let email = this.auth.getUserEmail()

    let obj:PerformanceObj = {
      categoryId: categoryId!,
      fullname: fullname!,
      email: email!,
      label: label!,
      grade: 0,
      overwrittenGrade: null,
      isReleased: false,
      isCanceled: false,
      academy: academy ? academy : "",
      coreographer: coreagrapher ? coreagrapher : "",
      isDeleted: false,
      isRejected: false,
      rejectedReason: '',
      city: city ? city : ""
    }
    let id=uuidv4()
    this.firebase.setDocument( [TournamentCollection.collectionName,this.tournamentId,PerformanceCollection.collectionName].join("/"), id, obj).then( ()=>{
      console.log("performances added")
      this.router.navigate([".."], { relativeTo: this.activatedRoute })
    },
    reason =>{
      alert("Error updating performances:" + reason)
    })
  }  
  onCancel(){
    this.router.navigate([".."], { relativeTo: this.activatedRoute })
  }
}
