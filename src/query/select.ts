/// <reference path="../../vendor/underscore.d.ts" />
/// <reference path="../common.ts" />
/// <reference path="../promises/promises.ts" />
/// <reference path="../table.ts" />
/// <reference path="./record.ts" />
/// <reference path="./transaction.ts" />
/// <reference path="./callbacks.ts" />
/// <reference path="./exceptions.ts" />
// <reference path="./base.ts" />
/// <reference path="./selectable.ts" />

module IndexedStorage {

	export module Query {

		export class Select extends Selectable {

			static factory( table:Table.Structure, whenDBReady:Promises.Promise<IDBDatabase> ):Selectable {
				return new Select( table, whenDBReady );
			}

			/**
			 * @param storeObject
			 * @param keyToUse
			 */
			public selectByPrimaryKey( storeObject:IDBObjectStore, keyToUse:KeyStats ):void {

				var that:Select = this;
				_.each( keyToUse.values, function ( value:any ):void {
					var request:IDBRequest = storeObject.get( value );
					request.onsuccess = function ( e:Event ):void {

						var record:Record = Record.load( value, (<IDBRequest>e.target).result );
						if ( that.filterValue( record ) ) {
							that.objects.push( record );
						}
						//@todo set result status
						that.whenComplete.resolve();
					};
					request.onerror = function ( e:Event ):void {
						//@todo set result status
						that.whenComplete.resolve();
					};
				} );
			}

			/**
			 * @param cursor
			 */
			public selectByCursor( cursor:IDBRequest ):void {

				var that:Select = this;
				cursor.onsuccess = function ( e:Event ):void {
					var cursor:IDBCursorWithValue = <IDBCursorWithValue>(<IDBRequest>e.target).result;
					if ( cursor ) {

						console.log( 'cursor', cursor, JSON.stringify( cursor ) );

						var record:Record = Record.load( cursor.primaryKey, cursor.value );
						if ( that.filterValue( record ) ) {
							that.objects.push( record );
						}
						cursor.continue();
					} else {
						that.whenComplete.resolve();
					}
				};
				cursor.onerror = function ( e:Event ):void {
					that.whenComplete.resolve();
				};
			}

			public each( callback:Callbacks.Each ):Select {

				console.log( 'super' );

				super.each( callback );

				console.log( 'super2' );
				var that:Select = this;
				this.whenComplete.getPromise().then( function () {
					console.log( 'whenComplete->each', JSON.stringify( that.objects ) );

					_.each( that.objects, function ( object:Record ):void {
						callback( object );
					} );
				} );
				return this;
			}
		}

	}
}