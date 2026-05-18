import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
    email = '';
    password = '';
    errorMessage = '';

    constructor(private authService: AuthService, private router: Router) {}

    login(): void {
        this.errorMessage = '';
        this.authService
            .login(this.email, this.password)
            .then(() => this.router.navigate(['/news/1']))
            .catch((error) => (this.errorMessage = error.message));
    }

    signup(): void {
        this.errorMessage = '';
        this.authService
            .signup(this.email, this.password)
            .then(() => this.router.navigate(['/news/1']))
            .catch((error) => (this.errorMessage = error.message));
    }

    googleSignIn(): void {
        this.errorMessage = '';
        this.authService
            .googleSignIn()
            .then(() => this.router.navigate(['/news/1']))
            .catch((error) => (this.errorMessage = error.message));
    }
}
