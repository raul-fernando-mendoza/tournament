import { Injectable } from '@angular/core';
import { collection, connectFirestoreEmulator, doc, DocumentData, DocumentSnapshot, Firestore, FirestoreError, where, getFirestore, onSnapshot, query, QuerySnapshot, Unsubscribe, WhereFilterOp, QueryFieldFilterConstraint, deleteDoc, and, getDocs, setDoc, getDoc, updateDoc, QueryDocumentSnapshot, arrayUnion, arrayRemove, orderBy, limit } from "firebase/firestore";
import { app } from '../environments/environment'
import { Filter } from './types';

export const fulldb:Firestore  = getFirestore(app);
connectFirestoreEmulator(fulldb, 'localhost', 8080);

@Injectable({
  providedIn: 'root'
})
export class FirebaseFullService {

  constructor() { }

  onsnapShotDoc(collectionPath:string, id:string, observer: {
    next?: ((snapshot: DocumentSnapshot<DocumentData>) => void) | undefined;
    error?: ((error: FirestoreError) => void) | undefined;
    complete?: (() => void) | undefined;
  }):Unsubscribe{
    const ref = doc( fulldb,collectionPath, id)
    return onSnapshot( ref , observer )  
  }

  onsnapShotCollection(collectionPath:string, observer: {
    next?: ((snapshot: QuerySnapshot<DocumentData>) => void) | undefined;
    error?: ((error: FirestoreError) => void) | undefined;
    complete?: (() => void) | undefined;
  }, filter?:QueryFieldFilterConstraint):Unsubscribe{
    let q
    if( filter ){
      q = query( collection(fulldb ,collectionPath), filter )
    }
    else{
      q = query( collection(fulldb ,collectionPath) )
    }
    return onSnapshot( q , observer )  
  }  
  
  setDocument(collectionPath:string, id:string, obj:{ [key: string]: any }):Promise<void>{
    obj["createon"] = new Date()
    obj["updateon"] = new Date()
    return setDoc( doc(fulldb, collectionPath , id), obj)
  }
  getDocument( collectionPath:string, id:string|null = null, filter:Array<Filter> | null = null):Promise<any>{
    return new Promise<any>(( resolve, reject) =>{
      if( id == null ){
        var ref = doc( fulldb,collectionPath )
      }
      else{
        var ref = doc( fulldb,collectionPath, id )
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
      var ref = doc( fulldb,collectionPath )
    }
    else{
      var ref = doc( fulldb,collectionPath, id )
    }    
    obj["updateon"] = new Date()
    return updateDoc( ref, obj)
  }
  getDocuments( collectionPath:string, filter:Array<Filter> | null = null):Promise<QueryDocumentSnapshot<DocumentData, DocumentData>[]>{
    return new Promise<Array<any>>((resolve, reject) =>{

      var q
      if( filter && filter.length>0){

        if( filter.length == 1){
          q = query(collection(fulldb, collectionPath), 
          and(where(filter[0].field, filter[0].operator, filter[0].value))) 
        }
        else {
          q = query(collection(fulldb, collectionPath), 
            and(where(filter[0].field, filter[0].operator, filter[0].value),
                where(filter[1].field, filter[1].operator, filter[1].value) 
            )
          )          
        }
      }
      else{
        q = query( collection(fulldb, collectionPath) )
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
    return updateDoc( doc(fulldb, collectionPath), obj)
  }  


  unionArrayElementDoc( collectionPath:string, key:string, value:string  ):Promise<void>{
    var obj:{ [key:string]:any } = {}
    obj["updateon"] = new Date()
    obj[key] = arrayUnion(value)
    return updateDoc(doc(fulldb, collectionPath), obj);
  }  

  unique(collectionPath:string,property:string):Promise<Set<string>>{
    return new Promise<Set<string>>((resolve, reject)=>{
      getDocs( collection(fulldb, collectionPath  ) ).then( docSet =>{
        var result = new Set<string>()
        docSet.docs.map( item =>{
          var obj = item.data()
          result.add( obj[property] )
        })
        resolve( result )
      })
    })
  }

  deleteDocument(collectionPath:string, id:string):Promise<void>{
    return deleteDoc( doc( fulldb, collectionPath, id )).then( () =>{
      console.log("remove successful")
    },
    reason =>{
      alert("ERROR removing:" + reason)
    })
  }
  getCollectionByTag( collectionName:string, tag:string):Promise<QueryDocumentSnapshot<DocumentData, DocumentData>[]>{
    return new Promise((resolve, reject) =>{
      const collectionRef = collection(fulldb, collectionName);
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
