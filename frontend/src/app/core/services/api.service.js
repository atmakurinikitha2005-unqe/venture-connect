import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  http = inject(HttpClient);

  constructor() {
    this.baseUrl = 'http://127.0.0.1:8000/api';
  }

  getHeaders() {
    const token = localStorage.getItem('vc_token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  get(endpoint, params) {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    return this.http.get(`${this.baseUrl}${endpoint}`, { headers: this.getHeaders(), params: httpParams });
  }

  post(endpoint, body) {
    return this.http.post(`${this.baseUrl}${endpoint}`, body, { headers: this.getHeaders() });
  }

  postFormData(endpoint, formData) {
    const token = localStorage.getItem('vc_token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return this.http.post(`${this.baseUrl}${endpoint}`, formData, { headers });
  }
}
