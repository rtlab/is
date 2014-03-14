module IndexedStorage {

	export module MetaData {

		export module LocalStorage {

			class Names {

				static table( database:string, table:string ):string {
					return 'STORAGE.SQL[%db].TABLES[%t]'.replace( '%db', database ).replace( '%t', table );
				}

				static version( database:string ):string {
					return 'STORAGE.SQL[%db].VERSION'.replace( '%db', database );
				}

				static structure( database:string, table:string ):string {
					return 'STORAGE.SQL[%db].STRUCTURE[%t]'.replace( '%db', database ).replace( '%t', table );
				}
			}

			export class Request {

				static getMeta( param:string, def:any = null ):any {
					var str:string = localStorage.getItem( param );
					return str ? JSON.parse( str ) : def;
				}

				static setMeta( param:string, value:any ):void {
					localStorage.setItem( param, JSON.stringify( value ) );
				}

				static getDatabaseCurrentVersion( database:string ):number {
					return <number>Request.getMeta( Names.version( database ), 0 );
				}

				static setDatabaseCurrentVersion( database:string, version:number ):void {
					Request.setMeta( Names.version( database ), version );
				}

				static getDatabaseTableChangeSets( database:string, table:string ):string[] {
					return <string[]>Request.getMeta( Names.table( database, table ), [] );
				}

				static setDatabaseTableChangeSet( database:string, table:string, changes:string[] ):void {
					Request.setMeta( Names.table( database, table ), changes );
				}

				static getDatabaseTableStructure( database:string, table:string ):string {
					return <string>Request.getMeta( Names.structure( database, table ), {} );
				}

				static setDatabaseTableStructure( database:string, table:string, structure:Object ):void {
					Request.setMeta( Names.structure( database, table ), structure );
				}
			}
		}
	}
}
