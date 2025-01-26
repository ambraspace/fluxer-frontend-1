import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Alarm } from './alarm';

@Injectable({
  providedIn: 'root'
})
export class AlarmService {

  constructor(private http: HttpClient) { }

  getAlarms(installationId: number, locationId: number, deviceId: number): Observable<Alarm[]>
  {
    return this.http.get<Alarm[]>(`/api/installations/${installationId}/locations/${locationId}/devices/${deviceId}/alarms`).pipe(
      catchError(err=>{
        return of([]);
      })
    )
  }

  getAlarm(installationId: number, locationId: number, deviceId: number, alarmId: number): Observable<Alarm>
  {
    return this.http.get<Alarm>(`/api/installations/${installationId}/locations/${locationId}/devices/${deviceId}/alarms/${alarmId}`).pipe(
      catchError(err=>{
        return of(null);
      })
    )
  }

  addAlarm(installationId: number, locationId: number, deviceId: number, alarm: Alarm): Observable<Alarm>
  {
    return this.http.post<Alarm>(`/api/installations/${installationId}/locations/${locationId}/devices/${deviceId}/alarms`, alarm).pipe(
      catchError(err => {
        return of(null);
      })
    );
  }

  // updateAlarm(installationId: number, locationId: number, deviceId: number, alarmId: number, alarm: Alarm): Observable<Alarm>
  // {
  //   return this.http.put<Alarm>(`/api/installations/${installationId}/locations/${locationId}/devices/${deviceId}/alarms/${alarmId}`, alarm).pipe(
  //     catchError(err => {
  //       return of(null);
  //     })
  //   );
  // }

  deleteAlarm(installationId: number, locationId: number, deviceId: number, alarmId: number): Observable<void>
  {
    return this.http.delete<void>(`/api/installations/${installationId}/locations/${locationId}/devices/${deviceId}/alarms/${alarmId}`).pipe(
      catchError(err=>{
        return of(null);
      })
    );
  }

}
