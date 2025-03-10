import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-event-form',
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.css']
})
export class EventFormComponent implements OnInit {
  eventForm: FormGroup;
  eventId: string | null = null;
  minDate: string;
  locations: string[] = ['Meet', 'Ubicación 1', 'Ubicación 2', 'Ubicación 3', 'Ubicación 4', 'Ubicación 5', 'Ubicación 6', 'Ubicación 7', 'Ubicación 8', 'Ubicación 9', 'Ubicación 10'];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.eventForm = this.fb.group({
      title: ['', Validators.required],
      date: ['', [Validators.required, this.dateValidator]],
      time: ['', Validators.required],
      description: ['', Validators.required],
      location: ['', Validators.required]
    });
    const today = new Date();
    today.setDate(today.getDate() - 1);
    this.minDate = today.toISOString().split('T')[0];
    
  }

  ngOnInit(): void {
    this.eventId = this.route.snapshot.paramMap.get('id');
    if (this.eventId) {
      this.loadEvent(this.eventId);
    }
  }

  
  loadEvent(id: string): void {
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any>(`http://localhost:3000/events/${id}`, { headers }).subscribe(
      data => {
        this.eventForm.patchValue(data);
      },
      error => {
        console.error('Error loading event', error);
      }
    );
  }

  dateValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      return { 'invalidDate': true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.eventForm.valid) {
      const token = this.authService.getToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      const formValue = this.eventForm.value;
      const dateTime = new Date(`${formValue.date}T${formValue.time}`);
  
      if (isNaN(dateTime.getTime())) {
        console.error('Invalid dateTime value:', `${formValue.date}T${formValue.time}`);
        return;
      }
  
      const eventPayload = {
        ...formValue,
        date: dateTime.toISOString()
        
      };
  
      this.http.post('http://localhost:3000/check-availability', eventPayload, { headers }).subscribe(
        (response: any) => {
          console.log('Availability response:', response);
          if (response.available) {
            if (this.eventId) {
              this.http.put(`http://localhost:3000/events/${this.eventId}`, eventPayload, { headers }).subscribe(
                response => {
                  console.log('Event updated', response);
                  alert('Se actualizó el evento correctamente'); 
                  this.router.navigate(['/events']);
                },
                error => {
                  console.error('Error updating event', error);
                }
              );
            } else {
              this.http.post('http://localhost:3000/events', eventPayload, { headers }).subscribe(
                response => {
                  console.log('Event created', response);
                  alert('Se creó el evento correctamente'); 
                  this.router.navigate(['/events']);
                },
                error => {
                  console.error('Error creating event', error);
                }
              );
            }
          } else {
            alert('La ubicación ya está siendo utilizada en la fecha seleccionada');
          }
        },
        error => {
          console.error('Error checking availabilitys', error);
        }
      );
    }
  }

  navigateToEventList(): void {
    this.router.navigate(['/events']);
  }
}