import { Component } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export interface Item {
  text: string;
  color: string;
  size: string;
}

@Component({
  selector: 'app-root',
  template: `
  <div *ngIf="items$ | async; let items; else loading">
    <ul>
      <li *ngFor="let item of items">
        {{ item.name }}
      </li>
    </ul>
    <div *ngIf="items.length === 0">No results, try clearing filters</div>
  </div>
  <ng-template #loading>Loading&hellip;</ng-template>
  <div>
    <h4>Filter by size</h4>
    <button (click)="filterBySize('small')">Small</button>
    <button (click)="filterBySize('medium')">Medium</button>
    <button (click)="filterBySize('large')">Large</button>
    <button (click)="filterBySize(null)" *ngIf="this.sizeFilter$.getValue()">
      <em>clear filter</em>
    </button>
  </div>
  <div>
    <h4>Filter by color</h4>
    <button (click)="filterByColor('red')">Red</button>
    <button (click)="filterByColor('green')">Blue</button>
    <button (click)="filterByColor('blue')">Green</button>
    <button (click)="filterByColor(null)" *ngIf="this.colorFilter$.getValue()">
      <em>clear filter</em>
    </button>
  </div>
  `,
})
export class AppComponent {
  items$: Observable<Item[]>;
  sizeFilter$: BehaviorSubject<string|null>;
  colorFilter$: BehaviorSubject<string|null>;
  
  constructor(afs: AngularFirestore) {
    this.sizeFilter$ = new BehaviorSubject(null);
    this.colorFilter$ = new BehaviorSubject(null);
    this.items$ = combineLatest(
      this.sizeFilter$,
      this.colorFilter$
    ).pipe(
      switchMap(([size, color]) => 
        afs.collection('items', ref => {
          let query : firebase.firestore.CollectionReference | firebase.firestore.Query = ref;
          if (size) { query = query.where('size', '==', size) };
          if (color) { query = query.where('color', '==', color) };
          return query;
        }).valueChanges()
      )
    );
  }
  filterBySize(size: string|null) {
    this.sizeFilter$.next(size); 
  }
  filterByColor(color: string|null) {
    this.colorFilter$.next(color); 
  }
}