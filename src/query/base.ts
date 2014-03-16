/// <reference path="../../vendor/underscore.d.ts" />
/// <reference path="../promises/promises.ts" />
/// <reference path="../common.ts" />
/// <reference path="../table.ts" />
/// <reference path="./record.ts" />
/// <reference path="./transaction.ts" />
/// <reference path="./callbacks.ts" />
/// <reference path="./exceptions.ts" />

module IndexedStorage {

	export module Query {

		interface CallbackTypes {
			each:Callbacks.Each[];
		}

		export class Base {

			public objects:Record[] = [];
			public request:Transaction = null;

			public whenReady:Promises.Defer<IDBDatabase> = null;
			public whenComplete:Promises.Defer<Transaction> = null;

			public stateEndOfQueries:boolean = false;

			private callbackWarnings:Callbacks.Warning[] = [];
			private listOfWarnings:Exception[] = [];

			private listOfCallbacks:CallbackTypes = { each: [] };

			constructor( public table:Table.Structure, whenDBReady:Promises.Promise<IDBDatabase> ) {

				var that:Base = this;
				this.whenReady = Promises.whenRequestReady();
				this.whenComplete = Promises.whenRequestComplete();

				whenDBReady.then( function ( database:IDBDatabase ) {
					/*var request:Transaction = Transaction.factory( database, [table.getName()] ).complete(function ( records:Record[] ):void {
					 that.setTransactionResults( records );
					 that.whenComplete.resolve( request );
					 } ).fail( function ():void {

					 } );*/
					that.whenReady.resolve( database );
				} );
			}

			public setTransactionResults( records:Record[] ):void {
				this.objects = records;
			}

			public warnings( callback:Callbacks.Warning ):Base {
				this.callbackWarnings.push( callback );
				_.each( this.listOfWarnings, function ( e:Exception ):void {
					callback( e );
				} );
				return this;
			}

			public addWarning( e:Exception ):void {
				this.listOfWarnings.push( e );
				_.each( this.callbackWarnings, function ( callback:Callbacks.Warning ):void {
					callback( e );
				} );
			}

			public addCallback( type:string, callback:Function ):void {
				this.listOfCallbacks[type].push( callback );
			}
		}
	}
}