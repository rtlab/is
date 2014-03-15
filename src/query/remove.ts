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

		export class Remove extends Selectable {

			static factory( table:Table.Structure, whenDBReady:Promises.Promise<IDBDatabase> ):Selectable {
				return new Remove( table, whenDBReady );
			}

			public each( callback:Callbacks.Each ):Remove {

				/*console.log( 'super' );

				 super.each( callback );

				 console.log( 'super2' );
				 var that:Select = this;
				 this.whenComplete.getPromise().then( function () {
				 console.log( 'whenComplete->each', JSON.stringify( that.objects ) );

				 _.each( that.objects, function ( object:Record ):void {
				 callback( object );
				 } );
				 } );*/
				return this;
			}
		}

	}
}