import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TableView } from './table-view';

@Injectable({
  providedIn: 'root'
})
export class TableViewService {

  constructor(private http: HttpClient) { }

  getTableViews(installationId: number): Observable<TableView[]>
  {
    return this.http.get<TableView[]>(`/api/installations/${installationId}/tableviews`).pipe(
      catchError(err => {
        return of([]);
      })
    );
  }

  getTableView(installationId: number, id: number): Observable<TableView>
  {
    return this.http.get<TableView>(`/api/installations/${installationId}/tableviews/${id}`).pipe(
      catchError(err => {
        return of(null);
      })
    );
  }

  addTableView(installationId: number, tv: TableView): Observable<TableView>
  {
    return this.http.post<TableView>(`/api/installations/${installationId}/tableviews`, tv).pipe(
      catchError(err => {
        return of(null)
      })
    )    
  }

  updateTableView(installationId: number, id: number, tv: TableView): Observable<TableView>
  {
    return this.http.put<TableView>(`/api/installations/${installationId}/tableviews/${id}`, tv).pipe(
      catchError(err => {
        return of(null)
      })
    )    
  }

  deleteTableView(installationId: number, id: number): Observable<void>
  {
    return this.http.delete<null>(`/api/installations/${installationId}/tableviews/${id}`).pipe(
      catchError (err => {
        return of(null)
      })
    )
  }

}
