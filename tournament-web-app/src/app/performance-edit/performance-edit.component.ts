import { Component } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';
import { FirebaseService } from '../firebase.service';
import { PerformanceCollection,Performance, PerformanceObj, TournamentCollection, TournamentObj } from '../types';
import { v4 as uuidv4, v4 } from 'uuid';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-performance-edit',
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
  templateUrl: './performance-edit.component.html',
  styleUrl: './performance-edit.component.css'
})
export class PerformanceEditComponent {
  tournamentId:string|null = null
  tournament:TournamentObj|null = null
  performanceId:string|null = null
  performance:PerformanceObj|null = null

  g = this.fb.group({
    id:[null],
    label:[""],
    categoryId:["",Validators.required],
    fullname:["",Validators.required]
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
          let performanceId = paramMap.get('performanceId')
          if( tournamentId && performanceId)
            thiz.tournamentId = tournamentId
            thiz.performanceId = performanceId
            thiz.update()
          }
  
        })       
  }
    
  update(){
    if( this.tournamentId != null){
      this.firebase.getDocument( TournamentCollection.collectionName, this.tournamentId).then( data =>{
        this.tournament = data as TournamentObj

        this.firebase.getDocument( 
          [TournamentCollection.collectionName,this.tournamentId, PerformanceCollection.collectionName].join("/")
          ,this.performanceId
        ).then( p =>{
          this.performance = p
          this.g.controls.label.setValue(p.label)
          this.g.controls.categoryId.setValue( p.categoryId )  
          this.g.controls.fullname.setValue( p.fullname )
        })

      })
    }
  }  

  onSubmit(){
    let label = this.g.controls["label"].value
    let categoryId = this.g.controls["categoryId"].value
    let fullname = this.g.controls["fullname"].value

    let obj:Performance = {
      categoryId: categoryId!,
      fullname: fullname!,
      label: label!,
      isAccepted: false,
      grade: 0,
      overwrittenGrade: null,
      isReleased: false
    }
    this.firebase.updateDocument( 
      [TournamentCollection.collectionName,this.tournamentId,PerformanceCollection.collectionName].join("/")
      , this.performanceId, obj).then( ()=>{
      console.log("performances updated")
      this.router.navigate(["../../"], { relativeTo: this.activatedRoute })
    },
    reason =>{
      alert("Error updating performances:" + reason)
    })
  }  
  onCancel(){
    this.router.navigate([".."], { relativeTo: this.activatedRoute })
  }


  
}
