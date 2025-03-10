import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a valid form when both fields are filled', () => {
    component.loginForm.setValue({ username: 'testuser', password: 'password' });
    expect(component.loginForm.valid).toBeTrue();
  });

  it('should show an alert and navigate on successful login', () => {
    spyOn(window, 'alert');
    authService.login.and.returnValue(of({ token: 'fake-jwt-token' }));

    component.loginForm.setValue({ username: 'testuser', password: 'password' });
    component.onSubmit();

    expect(window.alert).toHaveBeenCalledWith('Has iniciado sesión correctamente');
    expect(router.navigate).toHaveBeenCalledWith(['/events']);
  });

  it('should show an alert on login error', () => {
    spyOn(window, 'alert');
    authService.login.and.returnValue(throwError('error'));

    component.loginForm.setValue({ username: 'testuser', password: 'password' });
    component.onSubmit();

    expect(window.alert).toHaveBeenCalledWith('Verifique sus credenciales. Por favor, inténtalo de nuevo.');
  });
});