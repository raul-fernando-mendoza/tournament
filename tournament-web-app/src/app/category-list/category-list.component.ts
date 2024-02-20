import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { CommonModule, ViewportScroller } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FirebaseService } from '../firebase.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Category, Tournament, TournamentCollection, TournamentObj } from '../types';
import { v4 as uuidv4, v4 } from 'uuid';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { QuillModule } from 'ngx-quill'

@Component({
  selector: 'app-category-list',
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
    ,QuillModule
  ],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.css',

})
export class CategoryListComponent {
  @ViewChild("edited", {static: false}) childComponentRef: ElementRef | null = null;
    
  tournamentId:string | null = null
  tournament!:TournamentObj

  isAdding = false
  editingId:string | null = null  

  constructor( public firebaseService:FirebaseService 
    ,private fb:FormBuilder
    ,private activatedRoute: ActivatedRoute  
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

  form = new FormGroup({
    categories: new FormArray([]),
  });  

  getCategoryGroups(): FormGroup[] {
    let formArray:FormArray  = this.form.get('categories') as FormArray
    let formGroups:FormGroup[] = (formArray.controls) as FormGroup[]
    return formGroups
  }

  update(){
    this.isAdding = false
    this.editingId = null    
    this.firebaseService.getDocument( TournamentCollection.collectionName, this.tournamentId).then( (data)=>{
      this.tournament = data 
      let FA = this.form.get('categories') as FormArray
      FA.clear()
      if( FA ){
        this.tournament.categories?.map( category =>
          FA.push(
            this.fb.group({
              id:[category.id],
              label:[category.label,Validators.required],
              description:[category.description,Validators.required]
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
    let category = this.form.get('categories') as FormArray
    if( category ){
      category.push(
        this.fb.group({
          id:[null],
          label:['',Validators.required],
          description:['',Validators.required]
        })
      );
      this.isAdding = true
    }
  }
  onSubmit(){
    this.isAdding =false
    this.editingId = null     
    let categoryFGs = this.getCategoryGroups()
    let categoryGrp = categoryFGs[ categoryFGs.length -1 ]
    let id = categoryGrp?.controls["id"].value
    let label = categoryGrp?.controls["label"].value
    let description = categoryGrp?.controls["description"].value
    let category:Category = { 
      id:uuidv4(),
      label: label,
      description: description
    }
    this.tournament.categories.push( category )
    let obj:Tournament = {
      categories:this.tournament.categories
    }        
   
    this.firebaseService.updateDocument( TournamentCollection.collectionName, this.tournamentId, obj).then( ()=>{
      console.log("medals list updated")
      this.isAdding = false
      this.update()
    },
    reason =>{
      alert("Error updating medals")
    })    
  }

  onSave(id:string) {
    this.isAdding =false
    this.editingId = null       
    if( id ){

      let FGs = this.getCategoryGroups()
      let idx = FGs.findIndex( FG => FG.controls["id"].value == id )
      if( idx >= 0 ){
        let categoryGrp = FGs[idx]
        let label =  categoryGrp?.controls["label"].value.trim()
        let description =  categoryGrp?.controls["description"].value.trim()

        this.tournament.categories[ idx ].label = label
        this.tournament.categories[ idx ].description = description
        let obj:Tournament = {
          categories:this.tournament.categories
        }        
       
        this.firebaseService.updateDocument( TournamentCollection.collectionName, this.tournamentId, obj).then( ()=>{
          console.log("category list updated")
          this.update()
        },
        reason =>{
          alert("Error updating category")
        })
      }
    }
  }

  onDelete(id:string) {
    this.isAdding =false
    this.editingId = null 

    let idx:number = this.tournament.categories.findIndex( c => c.id == id)

    if( idx >= 0){
      this.tournament.categories.splice(idx,1)
      let obj:Tournament = {
        categories:[] = this.tournament.categories
      }
  
      this.firebaseService.updateDocument( TournamentCollection.collectionName, this.tournamentId, obj).then( ()=>{
        console.log("categories list updated")
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
    let FGs = this.getCategoryGroups()
    FGs.splice( FGs.length-1,1)
    this.isAdding =false
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
