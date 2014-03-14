/// <reference path="./localstorage.ts" />

module IndexedStorage {

	export module MetaData {

		export class Request {

			static getMeta( param:string, def:any ):any {
				return LocalStorage.Request.getMeta( param, def );
			}

			static setMeta( param:string, value:any ):void {
				LocalStorage.Request.setMeta( param, value );
			}

			static getDatabaseCurrentVersion( database:string ):number {
				return LocalStorage.Request.getDatabaseCurrentVersion( database );
			}

			static setDatabaseCurrentVersion( database:string, version:number ):void {
				LocalStorage.Request.setDatabaseCurrentVersion( database, version );
			}

			static getDatabaseTableChangeSets( database:string, table:string ):string[] {
				return LocalStorage.Request.getDatabaseTableChangeSets( database, table );
			}

			static setDatabaseTableChangeSet( database:string, table:string, changes:string[] ):void {
				LocalStorage.Request.setDatabaseTableChangeSet( database, table, changes );
			}

			static getDatabaseTableStructure( database:string, table:string ):string {
				return LocalStorage.Request.getDatabaseTableStructure( database, table );
			}

			static setDatabaseTableStructure( database:string, table:string, structure:string ):void {
				LocalStorage.Request.setDatabaseTableStructure( database, table, structure );
			}
		}
	}
}