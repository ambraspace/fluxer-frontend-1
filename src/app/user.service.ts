import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User } from './user';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private urlBase = "/api/users";

  constructor(private http: HttpClient) { }

  getUsers(): Observable<User[]>
  {
    return this.http.get<User[]>(this.urlBase).pipe(
      catchError( err => {return of([])})
    );
  }

  addUser(user: User): Observable<User>
  {
    return this.http.post<User>(this.urlBase, user).pipe(
      catchError( err => {return of(null)})
    );
  }

  updateUser(user: User): Observable<User>
  {
    return this.http.put<User>(this.urlBase + "/" + user.id, user).pipe(
      catchError( err => {return of(null)})
    );
  }

  deleteUser(id: number): Observable<null>
  {
    return this.http.delete<null>(this.urlBase + "/" + id).pipe(
      catchError( err => {return of(null)})
    );
  }
}
