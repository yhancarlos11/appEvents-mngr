import { TestBed, ComponentFixture } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { EventListComponent } from './event-list.component';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

describe('EventListComponent', () => {
  let component: EventListComponent;
  let fixture: ComponentFixture<EventListComponent>;
  let httpMock: HttpTestingController;
  let authService: AuthService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EventListComponent],
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [AuthService]
    }).compileComponents();

    fixture = TestBed.createComponent(EventListComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not load events on ngOnInit', () => {
    spyOn(component, 'loadEvents');
    component.ngOnInit();
    expect(component.loadEvents).not.toHaveBeenCalled();
  });

  it('should load events', () => {
    const mockEvents = [{ id: 1, date: '2023-01-01T00:00:00Z' }];
    spyOn(authService, 'getToken').and.returnValue('mock-token');
    component.loadEvents();
    const req = httpMock.expectOne('http://localhost:3000/events');
    expect(req.request.method).toBe('GET');
    req.flush(mockEvents);
    expect(component.events.length).toBe(1);
    expect(component.showTable).toBeTrue();
  });

  it('should create event', () => {
    const mockEvent = { id: 1, name: 'Test Event' };
    spyOn(authService, 'getToken').and.returnValue('mock-token');
    spyOn(component, 'loadEvents');
    component.createEvent(mockEvent);
    const req = httpMock.expectOne('http://localhost:3000/events');
    expect(req.request.method).toBe('POST');
    req.flush(mockEvent);
    expect(component.loadEvents).toHaveBeenCalled();
  });

  it('should navigate to edit event', () => {
    spyOn(router, 'navigate');
    component.editEvent(1);
    expect(router.navigate).toHaveBeenCalledWith(['/events/edit', 1]);
  });

  it('should update event', () => {
    const mockEvent = { id: 1, name: 'Updated Event' };
    spyOn(authService, 'getToken').and.returnValue('mock-token');
    spyOn(component, 'loadEvents');
    component.updateEvent(mockEvent);
    const req = httpMock.expectOne(`http://localhost:3000/events/${mockEvent.id}`);
    expect(req.request.method).toBe('PUT');
    req.flush(mockEvent);
    expect(component.loadEvents).toHaveBeenCalled();
  });

  it('should delete event', () => {
    spyOn(authService, 'getToken').and.returnValue('mock-token');
    component.events = [{ id: 1, name: 'Test Event' }];
    component.deleteEvent(1);
    const req = httpMock.expectOne('http://localhost:3000/events/1');
    expect(req.request.method).toBe('DELETE');
    req.flush({});
    expect(component.events.length).toBe(0);
  });

  it('should logout', () => {
    spyOn(authService, 'getToken').and.returnValue('mock-token');
    spyOn(router, 'navigate');
    spyOn(localStorage, 'removeItem');
    component.logout();
    const req = httpMock.expectOne('http://localhost:3000/logout');
    expect(req.request.method).toBe('POST');
    req.flush({});
    expect(localStorage.removeItem).toHaveBeenCalledWith('token');
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});