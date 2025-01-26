import { HttpClient } from '@angular/common/http';
import { htmlAstToRender3Ast } from '@angular/compiler/src/render3/r3_template_transform';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Location } from './location';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  constructor(private http: HttpClient) { }

  getLocations(installationId: number): Observable<Location[]>
  {
    return this.http.get<Location[]>(`/api/installations/${installationId}/locations`).pipe(
      catchError(err=>{
        return of([])
      })
    )
  }

  getLocation(installationId: number, locationId: number): Observable<Location>
  {
    return this.http.get<Location>(`/api/installations/${installationId}/locations/${locationId}`).pipe(
      catchError(err=>{
        return of(null);
      })
    );
  }

  addLocation(installationId: number, location: Location): Observable<Location>
  {
    return this.http.post<Location>(`/api/installations/${installationId}/locations`, location).pipe(
      catchError(err => {return of(null)})
    );
  }

  updateLocation(installationId: number, location: Location): Observable<Location>
  {
    return this.http.put<Location>(`/api/installations/${installationId}/locations/${location.id}`, location).pipe(
      catchError(err=>{
        return of(null);
      })
    );
  }

  deleteLocation(installationId: number, id: number): Observable<void>
  {
    return this.http.delete<void>(`/api/installations/${installationId}/locations/${id}`).pipe(
      catchError(err=>{return of(null)})
    )
  }

}
