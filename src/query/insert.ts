/// <reference path="../../vendor/underscore.d.ts" />
/// <reference path="../promises/promises.ts" />
/// <reference path="../common.ts" />
/// <reference path="../table.ts" />
/// <reference path="./record.ts" />
/// <reference path="./transaction.ts" />
/// <reference path="./callbacks.ts" />
/// <reference path="./base.ts" />

module IndexedStorage {

	export module Query {

		export class Insert extends Base {

			static factory( table:Table.Structure, whenDBReady:Promises.Promise<IDBDatabase> ):Insert {
				return new Insert( table, whenDBReady );
			}

			public set( value:any, id:any = null ):Insert {
				return this.records( [Record.insert( value, id )] );
			}

			public records( records:Record[] ):Insert {
				var that:Insert = this;
				this.whenReady.getPromise().then( function ( request:Transaction ):void {
					_.each( records, function ( record:Record ):void {
						request.add( that.table.getName(), record );
					} );
				} );
				return this;
			}

			public values( values:any[] ):Insert {
				var records:Record[] = [];
				_.each( values, function ( value:any ):void {
					records.push( Record.insert( value ) );
				} );
				return this.records( records );
			}

			public data( values:HashTable<any> ):Insert {
				var records:Record[] = [];
				_.each( values, function ( value:any, key?:string ):void {
					records.push( Record.insert( value, key ) );
				} );
				return this.records( records );
			}

			public each( callback:Callbacks.Each ):Insert {
				this.addCallback( 'each', callback );
				this.stateEndOfQueries = true;
				return this;
			}
		}
	}
}