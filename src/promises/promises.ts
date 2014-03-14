/// <reference path="../../vendor/when.d.ts" />
// <reference path="./query/transaction.ts" />

module IndexedStorage {

	export module Promises {

		export interface Promise<T> {

			/*catch<U>( onRejected?:( reason:any ) => Promise<U> ): Promise<U>;
			 catch<U>( onRejected?:( reason:any ) => U ): Promise<U>;

			 otherwise<U>( onRejected?:( reason:any ) => Promise<U> ): Promise<U>;
			 otherwise<U>( onRejected?:( reason:any ) => U ): Promise<U>;

			 then<U>( onFulfilled:( value:T ) => Promise<U>, onRejected?:( reason:any ) => Promise<U>, onProgress?:( update:any ) => void ): Promise<U>;
			 then<U>( onFulfilled:( value:T ) => Promise<U>, onRejected?:( reason:any ) => U, onProgress?:( update:any ) => void ): Promise<U>;
			 then<U>( onFulfilled:( value:T ) => U, onRejected?:( reason:any ) => Promise<U>, onProgress?:( update:any ) => void ): Promise<U>;
			 then<U>( onFulfilled:( value:T ) => U, onRejected?:( reason:any ) => U, onProgress?:( update:any ) => void ): Promise<U>;*/
		}

		export interface Defer<T> {
			notify( update:any ): void;
			getPromise():Promise<T>;
			reject( reason:any ): void;
			resolve( value?:T ): void;
		}

		export class DeferWhen<T> implements Defer<T> {

			private defer:when.Deferred<T> = null;

			constructor() {
				this.defer = when.defer<T>();
			}

			notify( update:any ):void {
				this.defer.notify( update );
			}

			getPromise():Promise<T> {
				return this.defer.promise;
			}

			reject( reason:any ):void {
				this.defer.reject( reason );
			}

			resolve( value?:T ):void {
				this.defer.resolve( value );
			}
		}

		export class PromiseWhen<T> implements Promise<T> {

			constructor( private promise:when.Promise<T> ) {

			}

			/*catch<U>( onRejected?:( reason:any ) => Promise<U> ): Promise<U>
			 catch<U>( onRejected?:( reason:any ) => U ): Promise<U>;

			 otherwise<U>( onRejected?:( reason:any ) => Promise<U> ): Promise<U>;
			 otherwise<U>( onRejected?:( reason:any ) => U ): Promise<U>;

			 then<U>( onFulfilled:( value:T ) => Promise<U>, onRejected?:( reason:any ) => Promise<U>, onProgress?:( update:any ) => void ): Promise<U>;
			 then<U>( onFulfilled:( value:T ) => Promise<U>, onRejected?:( reason:any ) => U, onProgress?:( update:any ) => void ): Promise<U>;
			 then<U>( onFulfilled:( value:T ) => U, onRejected?:( reason:any ) => Promise<U>, onProgress?:( update:any ) => void ): Promise<U>;
			 then<U>( onFulfilled:( value:T ) => U, onRejected?:( reason:any ) => U, onProgress?:( update:any ) => void ): Promise<U>;*/
		}


		/*static factory():when.Deferred<any[]> {
		 return when.defer<any[]>();
		 }

		 static databaseReady():when.Deferred<IDBDatabase> {
		 return when.defer<IDBDatabase>();
		 }

		 static all( items:when.Promise<any>[] ):when.Promise<any> {
		 return when.all<any>( items );
		 }

		 static storeRequest():when.Deferred<Query.Transaction> {
		 return when.defer<Query.Transaction>();
		 }

		 static objectStore():when.Deferred<IDBObjectStore> {
		 return when.defer<IDBObjectStore>();
		 }

		 static tableLock():when.Deferred<any[]> {
		 return when.defer<any[]>();
		 }*/
	}
}

