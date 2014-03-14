/// <reference path="./exceptions.ts" />
/// <reference path="./record.ts" />

module IndexedStorage {

	export module Query {

		export module Callbacks {

			export interface Each {
				( record:Record ):void;
			}

			export interface Warning {
				( e:Exception ):void;
			}

			export interface CustomFilter {
				( record:Record ):boolean;
			}
		}
	}
}