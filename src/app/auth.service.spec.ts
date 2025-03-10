import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([
          { path: 'login', component: DummyComponent } 
        ])
      ],
      providers: [AuthService]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should renew token', () => {
    const mockResponse = { token: '67890' };
    localStorage.setItem('token', '12345');
    service.renewToken().subscribe(response => {
      expect(response.token).toBe('67890');
      expect(localStorage.getItem('token')).toBe('67890');
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/renew-token`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });
});

import { Component } from '@angular/core';

@Component({
  template: ''
})
class DummyComponent {}