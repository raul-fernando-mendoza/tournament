import { Injectable } from '@angular/core';
import { collection, connectFirestoreEmulator, doc, DocumentData, DocumentSnapshot, Firestore, FirestoreError, getDocs, getFirestore, onSnapshot, query, QuerySnapshot, Unsubscribe } from "firebase/firestore";
import { app, db } from '../environments/environment'

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
  }):Unsubscribe{
    const q = query( collection(fulldb ,collectionPath) )
    return onSnapshot( q , observer )  
  }  
  

}
