/// <reference path="../../vendor/underscore.d.ts" />
/// <reference path="../common.ts" />
/// <reference path="./metadata.ts" />
/// <reference path="../table.ts" />

module IndexedStorage {

	export module Sync {

		class StrucureHash {
			static get( structure:Table.Info ):string {
				return JSON.stringify( { i: structure.ix, u: structure.ux} );
			}
		}

		export class Processor {

			static instances:HashTable<Processor> = {};

			static factory( database:string ):Processor {

				if ( !Processor.instances[ database ] ) {
					Processor.instances[database] = new Processor( database );
				}
				return Processor.instances[database];
			}

			private changes:HashTable<Table.ChangeSet[]> = {};
			private structures:HashTable<Table.Info> = {};
			private hashes:HashTable<string> = {};

			public constructor( private database:string ) {

			}

			public add( table:Table.Structure ):void {
				this.changes[ table.getName() ] = table.changes().list();
				this.structures[table.getName()] = table.getStructure();
				this.hashes[table.getName()] = StrucureHash.get( this.structures[table.getName()] );
			}

			public getDBVersion():number {

				var increment:number = 0;
				try {

					_.each( this.hashes, function ( structure:string, table?:string ):void {

						var current:string = MetaData.Request.getDatabaseTableStructure( this['database'], table );
						if ( current !== structure ) {
							throw new Error();
						}
					}, this );

					_.each( this.changes, function ( records:Table.ChangeSet[], table?:string ):void {

						var changes:string[] = MetaData.Request.getDatabaseTableChangeSets( this['database'], table );
						if ( changes.length >= records.length ) {

							_.each( records, function ( record:Table.ChangeSet ):void {

								if ( changes.indexOf( record.name ) < 0 ) {
									throw new Error();
								}
							} );

						} else {
							throw new Error();
						}
					}, this );

				} catch ( e ) {
					++increment;
				}
				return Math.max( 1, MetaData.Request.getDatabaseCurrentVersion( this.database ) + increment );
			}

			public update( request:IDBOpenDBRequest, oldVersion:number, newVersion:number ):void {

				console.log( 'UPDATE' );

				_.each( this.structures, function ( structure:Table.Info, table?:string ):void {
					var current:string = MetaData.Request.getDatabaseTableStructure( this['database'], table );
					if ( current !== this['hashes'][table] ) {

						(<Processor>this).updateStructure( request, table, structure );
						MetaData.Request.setDatabaseTableStructure( this['database'], table, this['hashes'][ table ] );
					}
				}, this );

				_.each( this.changes, function ( records:Table.ChangeSet[], table?:string ):void {

					var changes:string[] = MetaData.Request.getDatabaseTableChangeSets( this['database'], table );
					_.each( records, function ( record:Table.ChangeSet ):void {
						if ( changes.indexOf( record.name ) < 0 ) {
							if ( false !== record.callback( request, oldVersion, newVersion ) ) {
								changes.push( record.name );
							}
						}
					} );
					MetaData.Request.setDatabaseTableChangeSet( this['database'], table, changes );
				}, this );

				MetaData.Request.setDatabaseCurrentVersion( this.database, newVersion );
			}

			private updateStructure( request:IDBOpenDBRequest, table:string, structure:Table.Info ):void {

				console.log( request, table, structure );

				var store:IDBObjectStore = null;
				if ( !request.result.objectStoreNames.contains( table ) ) {

					var config:Object = {};


					if ( structure.key && _.isString( structure.key ) ) {
						config['keyPath'] = structure.key;
					}
					if ( !config['keyPath'] && structure.key ) {
						config['autoIncrement'] = true;
					}
					store = request.result.createObjectStore( table, config );
				} else {
					store = request.transaction.objectStore( table );

				}

				var indexes:string[] = StringsList.toArray( store.indexNames );
				_.each( [
					[structure.ux, true ],
					[structure.ix, false]
				], function ( indexParams:any[] ) {

					_.each( indexParams[0], function ( keyFields:any[] ):void {

						var keyName:string = Query.keyName( keyFields, indexParams[1] );
						var indexPos:number = indexes.indexOf( keyName );
						if ( indexPos < 0 ) {
							store.createIndex( keyName, keyFields.length === 1 ? keyFields[0] : keyFields, {unique: indexParams[1]} );
						} else {
							delete indexes[ indexPos ];
						}
					} );
				} );

				if ( indexes.length > 0 ) {
					_.each( indexes, function ( index:string ):void {
						store.deleteIndex( index );
					} );
				}
			}
		}
	}
}