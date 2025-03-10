import { Component } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(public authService: AuthService, private router: Router) {}
  title = 'events-mngr';
  logout() {
    this.authService.logout();
    this.router.navigate(['/']); 
  }
}