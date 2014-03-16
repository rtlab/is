/// <reference path="../../vendor/underscore.d.ts" />
/// <reference path="../promises/promises.ts" />
/// <reference path="../common.ts" />
/// <reference path="../common.ts" />
/// <reference path="./record.ts" />

module IndexedStorage {

	export module Query {

		export interface ProcessCallback {
			( store:IDBObjectStore, record:Record, defer:Promises.Defer<any> ):void ;
		}

		export interface InstanceCallback {
			( store:IDBObjectStore, record:Record ):IDBRequest;
		}

		export interface OnComplete {
			( records:Record[] ):void;
		}

		export interface OnSuccess {
			( request:IDBRequest ):void;
		}

		export interface OnFail {
			():void;
		}

		export class Transaction {

			static factory( database:IDBDatabase, tables:string[], readwrite:boolean = true ):Transaction {
				return new Transaction( database, tables, readwrite );
			}

			private current:IDBTransaction = null;
			private opened:HashTable<IDBObjectStore> = {};
			private operations:Promises.Promise<any>[] = [];
			private records:Record[] = [];

			private callbacksComplete:OnComplete[] = [];
			private callbacksSuccess:OnSuccess[] = [];
			private callbacksFail:OnFail[] = [];

			constructor( private database:IDBDatabase, private tables:string[], private readwrite:boolean ) {

			}

			private createTransaction():IDBTransaction {
				var transaction:IDBTransaction = this.database.transaction( this.tables, this.readwrite ? 'readwrite' : 'read' );
				transaction.oncomplete = function ( event:Event ) {

				};
				transaction.onabort = function ( event:Event ) {

				};
				transaction.onerror = function ( event:Event ) {

				};
				return transaction;
			}

			private open( table:string ):IDBObjectStore {
				try {
					this.current || (this.current = this.createTransaction());
					if ( !this.opened[ table ] ) {
						this.opened[table] = this.current.objectStore( table );
					}
					return this.opened[table];
				} catch ( e ) {
					return null;
				}
			}

			private recover( e:DOMException ):boolean {

				var isRecoverable:boolean = false;
				switch ( e.name ) {
					case 'TransactionInactiveError':
						isRecoverable = true;
						break;

					case 'ReadOnlyError':
						if ( !this.readwrite ) {
							isRecoverable = true;
							this.readwrite = true;
						}
						break;
				}
				if ( isRecoverable ) {
					this.current = null;
					this.opened = {};
				}
				return isRecoverable;
			}

			public request( table:string, record:Record, callback:ProcessCallback ):void {

				var repeatCounter:number = 3;
				var defer:Promises.Defer<any> = Promises.whenTransactionComplete();
				do {
					try {
						callback( this.open( table ), record, defer );
						this.operations.push( defer.getPromise() );
						repeatCounter = 0;
					} catch ( e ) {
						if ( !this.recover( e ) ) {
							record.error( e );
						} else if ( repeatCounter > 1 ) {
							continue;
						}
					}
					this.records.push( record );

				} while ( --repeatCounter > 0 );
			}

			public query( table:string, record:Record, callback:InstanceCallback ):void {

				var that:Transaction = this;
				var repeatCounter:number = 3;
				var defer:Promises.Defer<any> = Promises.whenTransactionComplete();
				do {
					try {
						var request:IDBRequest = callback( this.open( table ), record );
						request.onsuccess = function ( e:Event ):void {
							_.each( that.callbacksSuccess, function ( callback:OnSuccess ):void {
								callback.apply( (<IDBRequest>event.target), record );
							} );
						};
						request.onerror = function ( e:Event ):void {

						};

						//callback( this.open( table ), record, defer );
						this.operations.push( defer.getPromise() );
						repeatCounter = 0;
					} catch ( e ) {
						if ( !this.recover( e ) ) {
							record.error( e );
						} else if ( repeatCounter > 1 ) {
							continue;
						}
					}
					this.records.push( record );

				} while ( --repeatCounter > 0 );
			}

			private select( table:string, index:string = null, range:IDBKeyRange = null ):void {

				console.log( 'tr::select', table, index, range );

				var repeatCounter:number = 3;
				var that:Transaction = this;
				var defer:Promises.Defer<any> = Promises.whenTransactionComplete();
				do {
					try {

						var request:IDBRequest = index ? this.open( table ).index( index ).openCursor( range ) : this.open( table ).openCursor();
						request.onsuccess = function ( e:Event ):void {

							var cursor:IDBCursorWithValue = <IDBCursorWithValue>(<IDBRequest>e.target).result;
							if ( cursor ) {
								that.records.push( Record.load( cursor.primaryKey, cursor.value ) );
								cursor.continue();
							} else {
								defer.resolve();
							}
						};
						request.onerror = function ( e:Event ):void {
							defer.resolve();
						};
						this.operations.push( defer.getPromise() );
					} catch ( e ) {
						if ( this.recover( e ) ) {
							--repeatCounter;
							continue;
						}
					}
					repeatCounter = 0;
				} while ( repeatCounter > 0 );
			}

			public add( table:string, record:Record ) {

				console.log( 'tx.add' );
				this.request( table, record, function ( store:IDBObjectStore, record:Record, defer:Promises.Defer<any> ):void {

					console.log( record );

					var request:IDBRequest = store.add( record.get(), record.key() );
					request.onsuccess = function ( event:Event ):void {
						console.log( 'success' );
						record.inserted( (<IDBRequest>event.target).result );
						defer.resolve();
					};
					request.onerror = function ():void {
						console.log( 'fail' );
						defer.resolve( [record.failed()] );
					};
				} );
			}

			public put( table:string, record:Record ):void {

				this.request( table, record, function ( store:IDBObjectStore, record:Record, defer:Promises.Defer<any> ):void {

					var request:IDBRequest = store.put( record.get(), record.key() );
					request.onsuccess = function ( event:Event ):void {
						defer.resolve( record.inserted( (<IDBRequest>event.target).result ) );
					};
					request.onerror = function ():void {
						defer.resolve( record.failed() );
					};
				} );
			}

			public remove( table:string, record:Record ):void {

				this.request( table, record, function ( store:IDBObjectStore, record:Record, defer:Promises.Defer<any> ):void {

					var request:IDBRequest = store.delete( record.key() );
					request.onsuccess = function ( event:Event ):void {
						defer.resolve( record.completed() );
					};
					request.onerror = function ():void {
						defer.resolve( record.failed() );
					};
				} );
			}

			public get( table:string, key:any ):void {

				this.request( table, Record.select( key ), function ( store:IDBObjectStore, record:Record, defer:Promises.Defer<any> ):void {
					var request:IDBRequest = store.get( record.key() );
					request.onsuccess = function ( event:Event ):void {
						console.log( 'SELECTED', (<IDBRequest>event.target).result );
						defer.resolve( record.selected( (<IDBRequest>event.target).result ) );
					};
					request.onerror = function ():void {
						defer.resolve( record.failed() );
					};
				} );
			}

			public range( table:string, index:string, valueFrom:any, valueTo:any, openFrom:boolean, openTo:boolean ):void {

				if ( valueFrom !== null ) {
					var range:IDBKeyRange = ( valueTo !== null ? IDBKeyRange.bound( valueFrom, valueTo, !!openFrom, !!openTo ) : IDBKeyRange.upperBound( valueFrom, !!openFrom )  );
				} else {
					var range:IDBKeyRange = ( valueTo !== null ? IDBKeyRange.lowerBound( valueTo, !!openTo ) : null );
				}
				this.select( table, index, range );
			}

			public equal( table:string, index:string, value:any ):void {
				this.select( table, index, IDBKeyRange.only( value ) );
			}

			public all( table:string ):void {
				this.select( table );
			}

			public clear( table:string ) {

			}

			public count( table:string ) {

			}

			public end():void {
				var that:Transaction = this;
				Promises.all( this.operations ).then( function () {
					_.each( that.callbacksComplete, function ( callback:OnComplete ):void {
						console.log( callback, that.records );
						callback( that.records );
					} );
				} );
			}

			public success( callback:OnSuccess ):Transaction {
				this.callbacksSuccess.push( callback );
				return this;
			}

			public complete( callback:OnComplete ):Transaction {
				this.callbacksComplete.push( callback );
				return this;
			}

			public fail( callback:OnFail ):Transaction {
				this.callbacksFail.push( callback );
				return this;
			}

		}
	}
}