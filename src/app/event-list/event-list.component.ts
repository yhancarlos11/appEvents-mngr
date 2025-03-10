import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.css']
})
export class EventListComponent implements OnInit {
  events: any[] = [];
  showTable = false;
  constructor(private http: HttpClient, public authService: AuthService, private router: Router) {}

  ngOnInit() {

  }

  loadEvents() {
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
    this.http.get('http://localhost:3000/events', { headers })
      .subscribe((response: any) => {
        this.events = response.map((event: any) => {
          const dateTime = new Date(event.date);
          if (isNaN(dateTime.getTime())) {
            console.error('Invalid date value:', event.date);
            return {
              ...event,
              date: 'Invalid date',
              time: 'Invalid time'
            };
          }
          return {
            ...event,
            date: dateTime.toISOString().split('T')[0],
            time: dateTime.toTimeString().split(' ')[0]
          };
        }).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
        this.showTable = true; 
      }, error => {
        console.error('Error al obtener eventos:', error);
      });
  }

  createEvent(event: any) {
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.post('http://localhost:3000/events', event, { headers }).subscribe(
      response => {
        console.log('Event created', response);
        this.loadEvents(); 
      },
      error => {
        console.error('Error creating event', error);
      }
    );
  }

  editEvent(eventId: number) {
    this.router.navigate(['/events/edit', eventId]);
  }

  updateEvent(event: any) {
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.put(`http://localhost:3000/events/${event.id}`, event, { headers }).subscribe(
      response => {
        console.log('Event updated', response);
        this.loadEvents(); 
        event.editing = false;
      },
      error => {
        console.error('Error updating event', error);
      }
    );
  }


  deleteEvent(eventId: number) {
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.delete(`http://localhost:3000/events/${eventId}`, { headers }).subscribe(
      () => {
        this.events = this.events.filter(event => event.id !== eventId);
      },
      error => {
        console.error('Error deleting event:', error);
      }
    );
  }

  logout() {
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.post('http://localhost:3000/logout', {}, { headers }).subscribe(
      response => {
        localStorage.removeItem('token');
        this.router.navigate(['/login']);
        alert('Has cerrado sesión correctamente'); 
      },
      error => {
        console.error('Logout error', error);
      }
    );
  }  
}