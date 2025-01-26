import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Trigger } from './trigger';

@Injectable({
  providedIn: 'root'
})
export class TriggerService {

  constructor(private http: HttpClient) { }

  getTriggers(installationId: number): Observable<Trigger[]>
  {
    return this.http.get<Trigger[]>(`/api/installations/${installationId}/triggers`).pipe(
      catchError(err => {
        return of([]);
      })
    );
  }

  getTrigger(installationId: number, id: number): Observable<Trigger>
  {
    return this.http.get<Trigger>(`/api/installations/${installationId}/triggers/${id}`).pipe(
      catchError(err => {
        return of(null);
      })
    );
  }

  addTrigger(installationId: number, trigger: Trigger): Observable<Trigger>
  {
    return this.http.post<Trigger>(`/api/installations/${installationId}/triggers`, trigger).pipe(
      catchError(err => {
        return of(null)
      })
    )    
  }

  updateTrigger(installationId: number, id: number, trigger: Trigger): Observable<Trigger>
  {
    return this.http.put<Trigger>(`/api/installations/${installationId}/triggers/${id}`, trigger).pipe(
      catchError(err => {
        return of(null)
      })
    )    
  }

  deleteTrigger(installationId: number, id: number): Observable<void>
  {
    return this.http.delete<null>(`/api/installations/${installationId}/triggers/${id}`).pipe(
      catchError (err => {
        return of(null)
      })
    )
  }
  
}
