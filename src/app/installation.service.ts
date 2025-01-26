import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators'
import { AlarmCloneInstruction } from './alarm-clone-instruction';
import { AlarmData } from './alarm_data';
import { ChartPoint } from './chart-point';
import { Installation } from './installation';
import { Instruction } from './instruction';
import { LogRequest } from './log-request';

@Injectable({
  providedIn: 'root'
})
export class InstallationService {

  private urlBase: string = "/api/installations";

  selectedInstallationId: number;

  showMaps: boolean = true;

  constructor(private http: HttpClient) { }

  getInstallations(): Observable<Installation[]>
  {
    return this.http.get<Installation[]>(this.urlBase).pipe(
      catchError(err => {return of([])})
    );
  }

  getInstallation(id: number): Observable<Installation>
  {
    return this.http.get<Installation>(`${this.urlBase}/${id}`).pipe(
      catchError(err => {return of(null)})
    )
  }

  addInstallation(installation: Installation): Observable<Installation>
  {
    return this.http.post<Installation>(this.urlBase, installation).pipe(
      catchError(err => {return of(null)})
    )
  }

  updateInstallation(installation: Installation): Observable<Installation>
  {
    return this.http.put<Installation>(`${this.urlBase}/${installation.id}`, installation).pipe(
      catchError(err => {return of(null)})
    )
  }

  deleteInstallation(id: number): Observable<void>
  {
    return this.http.delete<null>(`${this.urlBase}/${id}`).pipe(
      catchError(err => {return of(null)})
    )
  }

  sendCommand(installationId: number, instruction: Instruction): Observable<void>
  {
    return this.http.post<void>(`/api/installations/${installationId}/command`, instruction).pipe(
      catchError(err => {
        return of(null);
      })
    );
  }

  getGraphData(installationId: number, request: LogRequest): Observable<ChartPoint[]>
  {
    return this.http.post<void>(`/api/installations/${installationId}/stats`, request).pipe(
      catchError(err => {
        return of(err);
      })
    );
  }

  cloneAlarms(installationId: number, instruction: AlarmCloneInstruction): Observable<void>
  {
    return this.http.post<void>(`/api/installations/${installationId}/clonealarms`, instruction).pipe(
      catchError(err => {
        return of(null);
      })
    );
  }

  getAlarms(installationId: number): Observable<AlarmData[]>
  {
    return this.http.get<AlarmData[]>(`${this.urlBase}/${installationId}/alarms`).pipe(
      catchError(err => {return of([])})
    );
  }

}
