import { Injectable, signal, inject } from '@angular/core';
import { ApiService } from './api.service';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  apiService = inject(ApiService);
  currentUser = signal(null);

  constructor() {
    this.loadUserFromStorage();
  }

  loadUserFromStorage() {
    const savedUser = localStorage.getItem('vc_user');
    if (savedUser) {
      try {
        this.currentUser.set(JSON.parse(savedUser));
      } catch (e) {
        this.logout();
      }
    }
  }

  login(credentials) {
    return this.apiService.post('/auth/login', credentials).pipe(
      tap(res => {
        localStorage.setItem('vc_token', res.access_token);
        localStorage.setItem('vc_user', JSON.stringify(res.user));
        this.currentUser.set(res.user);
      })
    );
  }

  register(userData) {
    return this.apiService.post('/auth/register', userData).pipe(
      tap(res => {
        localStorage.setItem('vc_token', res.access_token);
        localStorage.setItem('vc_user', JSON.stringify(res.user));
        this.currentUser.set(res.user);
      })
    );
  }

  logout() {
    localStorage.removeItem('vc_token');
    localStorage.removeItem('vc_user');
    this.currentUser.set(null);
  }

  get userRole() {
    const user = this.currentUser();
    return user ? user.role : null;
  }
}
