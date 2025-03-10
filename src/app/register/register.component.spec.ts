import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { RegisterComponent } from './register.component';
import { AuthService } from '../auth.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['register']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [RegisterComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have an invalid form when empty', () => {
    expect(component.registerForm.valid).toBeFalsy();
  });

  it('should have a valid form when filled', () => {
    component.registerForm.controls['username'].setValue('testuser');
    component.registerForm.controls['password'].setValue('password');
    expect(component.registerForm.valid).toBeTruthy();
  });

  it('should call AuthService register method on valid form submission', () => {
    component.registerForm.controls['username'].setValue('testuser');
    component.registerForm.controls['password'].setValue('password');
    authService.register.and.returnValue(of({}));

    component.onSubmit();

    expect(authService.register).toHaveBeenCalledWith('testuser', 'password');
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should handle registration error', () => {
    component.registerForm.controls['username'].setValue('testuser');
    component.registerForm.controls['password'].setValue('password');
    authService.register.and.returnValue(throwError('Registration error'));

    component.onSubmit();

    expect(authService.register).toHaveBeenCalledWith('testuser', 'password');
    expect(router.navigate).not.toHaveBeenCalled();
  });
});