import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { CommonModule, ViewportScroller } from '@angular/common';
import {FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FirebaseService } from '../firebase.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Medal, Tournament, TournamentCollection, TournamentObj } from '../types';
import { v4 as uuidv4, v4 } from 'uuid';
import {MatGridListModule} from '@angular/material/grid-list';
import { QuillModule } from 'ngx-quill'
import {MatCardModule} from '@angular/material/card';

@Component({
  selector: 'app-medals-list',
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
    ,MatGridListModule
    ,QuillModule
    ,MatCardModule
  ],
  templateUrl: './medals-list.component.html',
  styleUrl: './medals-list.component.css',

})
export class MedalsListComponent implements AfterViewInit{
  @ViewChild("edited", {static: false}) childComponentRef: ElementRef | null = null;
  
  tournamentId:string | null = null
  tournament!:TournamentObj

  isAdding = false

  editingId:string | null = null

  constructor( public firebaseService:FirebaseService 
    ,private fb:FormBuilder
    ,private activatedRoute: ActivatedRoute    
    ,private router: Router
    ,private viewportScroller: ViewportScroller
  ){
    var thiz = this
    this.activatedRoute.paramMap.subscribe({
        next(paramMap){
          thiz.tournamentId = null
          if( paramMap.get('tournamentId')!=null ){
            thiz.tournamentId = paramMap.get('tournamentId')
            thiz.update()
          }
        }
      })
  }
  ngAfterViewInit(): void {
    console.log( this.childComponentRef )
  }

  form = new FormGroup({
    medals: new FormArray([]),
  });  

  getGroups(): FormGroup[] {
    let formArray:FormArray  = this.form.get('medals') as FormArray
    let formGroups:FormGroup[] = (formArray.controls) as FormGroup[]
    return formGroups
  }

  update(){
    this.isAdding = false
    this.editingId = null    
    this.firebaseService.getDocument( TournamentCollection.collectionName, this.tournamentId).then( (data)=>{
      this.tournament = data 
      let medals = this.form.get('medals') as FormArray
      medals.clear()
      if( medals ){
        this.tournament.medals?.map( medal =>
          medals.push(
            this.fb.group({
              id:[medal.id,Validators.required],
              label:[medal.label,Validators.required],
              description:[medal.description],
              minGrade:[medal.minGrade,[Validators.required, Validators.min(0), Validators.max(10)]]
            })
          )
        )
      }      
    },
    reason =>{
      alert("Error updating medals")
    })    
  }

  onAdd() {
    this.isAdding =true
    this.editingId = null       
    let medals = this.form.get('medals') as FormArray
    if( medals ){
      medals.push(
        this.fb.group({
          id:[null],
          label:['',Validators.required],
          description:[''],
          minGrade:['',[Validators.required, Validators.min(0), Validators.max(10)]]
        })
      );
      this.waitForElement("edited")      
    }
    
  }
  onSubmit(){
    this.isAdding =false
    this.editingId = null   

    let FGs = this.getGroups()
    let categoryGrp = FGs[ FGs.length -1 ]
    let id = categoryGrp?.controls["id"].value
    let label = categoryGrp?.controls["label"].value.trim()
    let minGrade =  categoryGrp?.controls["minGrade"].value 
    let description = categoryGrp?.controls["description"].value.trim()
    let medal:Medal = { 
      id:uuidv4(),
        label: label,
        minGrade: Number(minGrade),
        description:description ? description : ""
      }
    this.tournament.medals.push( medal )
    this.tournament.medals.sort( (a,b)=>{
      return a.minGrade >= b.minGrade ? -1 : 1
    }) 
    let obj:Tournament = {
      medals:this.tournament.medals
    }
    this.firebaseService.updateDocument( TournamentCollection.collectionName, this.tournamentId, obj).then( ()=>{
      console.log("medals list updated")
      this.update()
    },
    reason =>{
      alert("Error updating medals")
    })
  }

  onSave(id:string) {
    this.isAdding =false
    this.editingId = null       
    console.log("on save")
    if( id ){

      let FGs = this.getGroups()
      let idx = FGs.findIndex( FG => FG.controls["id"].value == id )
      if( idx >= 0 ){
        let categoryGrp = FGs[idx]
        let label =  categoryGrp?.controls["label"].value.trim()
        let minGrade =  Number(categoryGrp?.controls["minGrade"].value)
        let description =  categoryGrp?.controls["description"].value?.trim()
      
        this.tournament.medals[ idx ].label = label
        this.tournament.medals[ idx ].minGrade = minGrade
        this.tournament.medals[ idx ].description = description ? description : ""

        this.tournament.medals.sort( (a,b)=>{
          return a.minGrade >= b.minGrade ? -1 : 1
        }) 

        let obj:Tournament = {
          medals:this.tournament.medals
        }        
 
        this.firebaseService.updateDocument( TournamentCollection.collectionName, this.tournamentId, obj).then( ()=>{
          console.log("medals list updated")
          this.update()

        },
        reason =>{
          alert("Error updating medals")
        })
      }
    }
  }

  onDelete(id:string) {
    this.isAdding =false
    this.editingId = null   

    let idx:number = this.tournament.medals.findIndex( c => c.id == id)

    if( idx >= 0){
      this.tournament.medals.splice(idx,1)
      let obj:Tournament = {
        medals:[] = this.tournament.medals
      }
  
      this.firebaseService.updateDocument( TournamentCollection.collectionName, this.tournamentId, obj).then( ()=>{
        console.log("medals list updated")
        this.update()
      },
      reason =>{
        alert("Error updating categories")
      })
    }
  }
  onCancelAdd(){
    this.isAdding =false
    this.editingId = null    
    let FGs = this.getGroups()
    FGs.splice( FGs.length-1,1)

  }  

  onCancelEdit(){
    this.isAdding = false
    this.editingId = null    
    this.update()
  }  

  onEdit(id:string){
    this.isAdding = false
    this.editingId = id
    this.waitForElement("edited")
  }

  waitForElement(selector:string) {
    let thiz = this
    let observer = new MutationObserver(mutations => {
      mutations.forEach(function(mutation) {
        if( thiz.childComponentRef ){
          observer.disconnect();
          thiz.scroll(selector)
        }
      });
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }


  scroll(selector:string) {
    this.viewportScroller.scrollToAnchor(selector)
  }


}
