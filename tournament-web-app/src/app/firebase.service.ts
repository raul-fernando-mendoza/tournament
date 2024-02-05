import { Injectable } from '@angular/core';
import { db } from '../environments/environment'
import { QueryDocumentSnapshot, collection, doc, limit, deleteDoc , getDoc, and, getDocs, query, setDoc, updateDoc, DocumentData, arrayRemove, where, FieldPath, WhereFilterOp, orderBy, QueryConstraint, Query, QueryNonFilterConstraint, startAt, OrderByDirection, arrayUnion, DocumentSnapshot, FirestoreError} from "firebase/firestore/lite"; 
import { MatSelectChange } from '@angular/material/select';
import { Filter } from './types';
import { Unsubscribe } from 'firebase/auth';


export interface QryPar {
  collectionPath:string,
  fieldPath?:string|null,
  opStr?:WhereFilterOp|null,
  value?:unknown|null,
  orderByField?:FieldPath|string,
  orderDirection?:OrderByDirection |undefined,
  startAtPage?:number|null,  
  pageSize?:number|null
}

@Injectable({ 
  providedIn: 'root'
})
export class FirebaseService {
  

  constructor() { }



  setDocument(collectionPath:string, id:string, obj:{ [key: string]: any }):Promise<void>{
    obj["createon"] = new Date()
    obj["updateon"] = new Date()
    return setDoc( doc(db, collectionPath , id), obj)
  }
  getDocument( collectionPath:string, id:string|null = null, filter:Array<Filter> | null = null):Promise<any>{
    return new Promise<any>(( resolve, reject) =>{
      if( id == null ){
        var ref = doc( db,collectionPath )
      }
      else{
        var ref = doc( db,collectionPath, id )
      }
      getDoc( ref ).then( docSnap =>{
        if( docSnap.exists() ){
          return resolve( docSnap.data() )
        }
        else{
          reject("not found")
        }
      },
      reason=>{
        reject(reason)
      })
    })
  }
 
  updateDocument( collectionPath:string, id:string|null = null, obj:{ [key: string]: any }):Promise<void>{
    if( id == null ){
      var ref = doc( db,collectionPath )
    }
    else{
      var ref = doc( db,collectionPath, id )
    }    
    obj["updateon"] = new Date()
    return updateDoc( ref, obj)
  }
  getDocuments( collectionPath:string, filter:Array<Filter> | null = null):Promise<QueryDocumentSnapshot<DocumentData, DocumentData>[]>{
    return new Promise<Array<any>>((resolve, reject) =>{

      var q
      if( filter ){

        if( filter.length == 1){
          q = query(collection(db, collectionPath), 
          and(where(filter[0].field, filter[0].operator, filter[0].value))) 
        }
        else{
          q = query(collection(db, collectionPath), 
            and(where(filter[0].field, filter[0].operator, filter[0].value),
                where(filter[1].field, filter[1].operator, filter[1].value) 
            )
          )          
        }
      }
      else{
        q = query( collection(db, collectionPath) )
      }
      getDocs ( q ).then( data =>{
        resolve( data.docs )
      },
      reason =>{
        alert("ERROR:" + reason)
      })
    })
     
  }

  removeArrayElementDoc( collectionPath:string, key:string, value:string  ):Promise<void>{
    var obj:{ [key:string]:any } = {}
    obj["updateon"] = new Date()
    obj[ key ] = arrayRemove(value)
    return updateDoc( doc(db, collectionPath), obj)
  }  


  unionArrayElementDoc( collectionPath:string, key:string, value:string  ):Promise<void>{
    var obj:{ [key:string]:any } = {}
    obj["updateon"] = new Date()
    obj[key] = arrayUnion(value)
    return updateDoc(doc(db, collectionPath), obj);
  }  

  unique(collectionPath:string,property:string):Promise<Set<string>>{
    return new Promise<Set<string>>((resolve, reject)=>{
      getDocs( collection(db, collectionPath  ) ).then( docSet =>{
        var result = new Set<string>()
        docSet.docs.map( item =>{
          var obj = item.data()
          result.add( obj[property] )
        })
        resolve( result )
      })
    })
  }


/*

  onsnapShotQuery({
    collectionPath,
    fieldPath,
    opStr,
    value,
    orderByField,
    orderDirection,
    startAtPage,
    pageSize
  }:QryPar
    ,observer: {
      next?: (snapshot: any) => void;
      error?: (error: FirestoreError) => void;
      complete?: () => void;
    }
      ):Unsubscribe{

    var q :Query<DocumentData> 
    var queryFilterConstraints: QueryNonFilterConstraint[]  = []
    
    if( orderByField != null ){
      queryFilterConstraints.push(  orderBy(orderByField , orderDirection) )
    }
    if( pageSize != null){
      queryFilterConstraints.push(  limit(pageSize ) )
    }    
    if( startAtPage != null && pageSize != null){
      queryFilterConstraints.push( startAt( (startAtPage-1) * pageSize ) )
    }

    if ( fieldPath != null && opStr!=null && value!=null){
      q = query(collection(db, collectionPath), where(fieldPath, opStr, value), ...queryFilterConstraints)
    }      
    else{
      q = query(collection(db, collectionPath),...queryFilterConstraints); 
    }

    return onSnapshot(q, observer )
     
  }


  onsnapShot(collectionPath:string, id:string, observer: {
    next?: ((snapshot: DocumentSnapshot<DocumentData>) => void) | undefined;
    error?: ((error: FirestoreError) => void) | undefined;
    complete?: (() => void) | undefined;
  }):Unsubscribe{
    return onSnapshot( doc( db,collectionPath, id), observer )  
  }
 */ 

  onChange(event:any, collectionPath:string, id:string|null, propertyName:string):Promise<void>{
    return new Promise<void>(( resolve, reject)=>{
      var value:any = event.target.value      
      var values:any = {}
      values[propertyName]=value 
      values["updateon"] = new Date()
      if( id ){
        updateDoc( doc( db, collectionPath, id), values ).then( ()=>{
          resolve()
        })
      }
      else{
        reject( "id is null")
      }
    })
    
  }
  onCheckboxChange(event:any, collectionPath:string, id:string|null, propertyName:string):Promise<void>{
    return new Promise<void>(( resolve, reject)=>{
      var value:boolean = event.checked     
      var values:any = {}
      values[propertyName]=value   
      values["updateon"] = new Date()
      if( id ){
        updateDoc( doc( db, collectionPath, id), values ).then( ()=>{
          resolve()
        })
      }
      else{
        reject( "id is null")
      }
    })
  }  
  onArrayCheckboxChange(event:any, collectionPath:string, id:string|null, array:any, propertyName:string, index:number, key:string):Promise<void>{
    return new Promise<void>(( resolve, reject)=>{
      var value:boolean = event.checked     
      var values:any = {}
      array[index][key] = value
      values[propertyName]=array   
      values["updateon"] = new Date()
      if( id ){
        updateDoc( doc( db, collectionPath, id), values ).then( ()=>{
          console.log("update property")
        },
        reason =>{
          alert("ERROR update arraycheckbox:" + reason)
        })
      }
      else{
        reject( "id is null")
      }
    })
  }   
  onSelectionChange(event:MatSelectChange, collectionPath:string, id:string|null, propertyName:string):Promise<void>{
    return new Promise<void>(( resolve, reject)=>{
      var value = event.source.ngControl.value  
      var values:any = {}
      if( value == undefined ){
        values[propertyName]=null     
      }
      else values[propertyName]=value  
      values["updateon"] = new Date() 
      if( id ){
        updateDoc( doc( db, collectionPath, id), values ).then( ()=>{
          console.log("update property")
        },
        reason=>{
          alert("ERROR:" + reason)
        })
      }
      else{
        reject( "id is null")
      }
    })    
  }  

  deleteDocument(collectionPath:string, id:string):Promise<void>{
    return deleteDoc( doc( db, collectionPath, id )).then( () =>{
      console.log("remove successful")
    },
    reason =>{
      alert("ERROR removing:" + reason)
    })
  }
  getCollectionByTag( collectionName:string, tag:string):Promise<QueryDocumentSnapshot<DocumentData, DocumentData>[]>{
    return new Promise((resolve, reject) =>{
      const collectionRef = collection(db, collectionName);
      var q
      if( tag != ""){
        q = query(collectionRef, and(where("tags", "array-contains", tag), where("active","==",true)), orderBy("eventDate", "asc"), limit(100)); 
      }
      else{
        let t =  (new Date())
        //q = query(collectionRef, and( where("eventDate","==",t) , where("active","==",true)), orderBy("eventDate", "asc"),limit(100) ); 
        //q = query(collectionRef, orderBy("eventDate", "asc"), limit(100) ); 
        //q = query(collectionRef, and( where("eventDate","==",t) ), orderBy("eventDate", "asc"),limit(100) ); 
        q = query(collectionRef, where("active","==",true), orderBy("eventDate", "asc"), limit(100)); 
      }
      getDocs ( q ).then( data =>{
        resolve( data.docs )
      },
      reason=>{
        console.log( reason )
        reject(reason)
      })
    })
  }

}