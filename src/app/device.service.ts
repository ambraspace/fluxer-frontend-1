import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Device } from './device';
import { DeviceType } from './device-type';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {

  constructor(private http: HttpClient) { }

  getDeviceTypes(): Observable<DeviceType[]>
  {
    return this.http.get<DeviceType[]>(`/api/devicetypes`).pipe(
      catchError(err => {
        return of([])
      })
    );
  }

  getDevices(installationId: number, locationId: number): Observable<Device[]>
  {
    return this.http.get<Device[]>(`/api/installations/${installationId}/locations/${locationId}/devices`).pipe(
      catchError(err=>{
        return of([]);
      })
    )
  }

  getInstallationDevices(installationId: number): Observable<Device[]>
  {
    return this.http.get<Device[]>(`/api/installations/${installationId}/devices`).pipe(
      catchError(err=>{
        return of([]);
      })
    )
  }

  getDevice(installationId: number, locationId: number, deviceId: number): Observable<Device>
  {
    return this.http.get<Device>(`/api/installations/${installationId}/locations/${locationId}/devices/${deviceId}`).pipe(
      catchError(err=>{
        return of(null);
      })
    )
  }

  addDevice(installationId: number, locationId: number, device: DeviceType): Observable<Device>
  {
    return this.http.post<Device>(`/api/installations/${installationId}/locations/${locationId}/devices`, device).pipe(
      catchError(err => {
        return of(null);
      })
    );
  }

  updateDevice(installationId: number, locationId: number, deviceId: number, device: DeviceType): Observable<Device>
  {
    return this.http.put<Device>(`/api/installations/${installationId}/locations/${locationId}/devices/${deviceId}`, device).pipe(
      catchError(err => {
        return of(null);
      })
    );
  }

  deleteDevice(installationId: number, locationId: number, deviceId: number): Observable<void>
  {
    return this.http.delete<void>(`/api/installations/${installationId}/locations/${locationId}/devices/${deviceId}`).pipe(
      catchError(err=>{
        return of(null);
      })
    );
  }
  
}
