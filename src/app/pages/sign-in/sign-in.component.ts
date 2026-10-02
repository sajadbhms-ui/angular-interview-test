import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent {
  isSubmitting = false;
  errorMessage = '';

  signInForm = this.formBuilder.group({
    username: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (this.signInForm.invalid || this.isSubmitting) {
      this.signInForm.markAllAsTouched();
      return;
    }

    const { username, password } = this.signInForm.getRawValue();

    if (!username || !password) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.authService.login(username, password).subscribe({
      next: (response) => {
        let token = response.trim();

try {
  const parsed: unknown = JSON.parse(token);
  if (typeof parsed === 'string') {
    token = parsed;
  }
} catch {
  // The response may already be plain text.
}

token = token
  .trim()
  .replace(/^Bearer\s+/i, '')
  .replace(/^["']|["']$/g, '');

        if (!token) {
          this.errorMessage = 'Sign-in failed: the server returned no token.';
          this.isSubmitting = false;
          return;
        }

       localStorage.setItem('access_token', token);

        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.errorMessage =
          'Sign-in failed. Check your credentials and try again.';
        this.isSubmitting = false;
      }
    });
  }
}