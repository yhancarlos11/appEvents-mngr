import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      this.authService.login(username!, password!).subscribe(response => {
        console.log('JWT Token:', response.token);
        alert('Has iniciado sesión correctamente'); 
        this.router.navigate(['/events']);
      }, error => {
        console.error('Error al iniciar sesión:', error);
        alert('Verifique sus credenciales. Por favor, inténtalo de nuevo.');
      });
    }
  }
}