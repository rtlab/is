/// <reference path="../vendor/underscore.d.ts" />
/// <reference path="./common.ts" />
/// <reference path="./sync/sync.ts" />
/// <reference path="./table.ts" />
/// <reference path="./promises/promises.ts" />
/// <reference path="./query/select.ts" />
// <reference path="./query/insert.ts" />

module IndexedStorage {

	export class Storage {

		static indexedDB:IDBFactory = null;
		static instances:HashTable<Storage> = {};

		static factory( name:string ):Storage {

			if ( Storage.indexedDB === null ) {
				Storage.indexedDB = indexedDB || window['indexedDB'] || window['webkitIndexedDB'] || window['mozIndexedDB'] || window['OIndexedDB'] || window['msIndexedDB'] || false;
			}

			if ( !Storage.instances[ name ] ) {
				Storage.instances[name] = new Storage( name );
			}
			return Storage.instances[name];
		}

		private isOpened:boolean = false;
		private tables:HashTable<Table.Structure> = {};
		private whenReady:Promises.Defer<IDBDatabase> = null;

		constructor( private name:string ) {
			this.whenReady = Promises.whenDatabaseReady();
		}

		public getName():string {
			return this.name;
		}

		public register( table:Table.Structure ):Table.Structure {
			return table ? (this.tables[table.getName()] = table) : null
		}

		public select( name:string ):Query.Select {
			console.log( 'select' );
			this.isOpened || this.openDatabase();
			return Query.Select.factory( this.tables[ name ], this.whenReady.getPromise() );
		}

		/*
		 public insert( name:string ):Query.Insert {
		 this.isOpened || this.openDatabase();
		 return Query.Insert.factory( this.tables[name], this.whenReady.promise );
		 }

		 public remove( name:string ):Query.Selectable {
		 return null;
		 }*/

		private openDatabase():void {

			console.log( 'sync' );

			var syncObj:Sync.Processor = Sync.Processor.factory( this.name );

			_.each( this.tables, function ( table:Table.Structure ):void {
				syncObj.add( table );
			} );

			//@todo remove
			console.log( 'openDB. version: ', syncObj.getDBVersion() );

			var that:Storage = this;
			var request:IDBOpenDBRequest = Storage.indexedDB.open( this.getName(), syncObj.getDBVersion() );
			request.onupgradeneeded = function ( e:IDBVersionChangeEvent ) {
				syncObj.update( request, e.oldVersion, e.newVersion );
			};
			request.onsuccess = function ( e:Event ) {
				that.whenReady.resolve( (<IDBOpenDBRequest>e.target).result );
			};
			this.isOpened = true;
		}
	}
}