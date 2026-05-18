import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import firebase from 'firebase/app';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    user$: Observable<firebase.User>;

    constructor(private afAuth: AngularFireAuth) {
        this.user$ = this.afAuth.authState;
    }

    login(email: string, password: string): Promise<firebase.auth.UserCredential> {
        return this.afAuth.signInWithEmailAndPassword(email, password);
    }

    signup(email: string, password: string): Promise<firebase.auth.UserCredential> {
        return this.afAuth.createUserWithEmailAndPassword(email, password);
    }

    googleSignIn(): Promise<firebase.auth.UserCredential> {
        return this.afAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    }

    logout(): Promise<void> {
        return this.afAuth.signOut();
    }

    isLoggedIn(): Observable<boolean> {
        return this.afAuth.authState.pipe(map((user) => !!user));
    }
}
