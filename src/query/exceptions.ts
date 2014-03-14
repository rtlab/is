module IndexedStorage {

	export module Query {

		export class Exception {

			static noMoreQueries():Exception {
				return new Exception( 'NoMoreQueries', 'No more queries after each or similar functions' );
			}

			constructor( public name:string, public message:string = '' ) {

			}
		}
	}
}