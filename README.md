Indexed Storage ( IndexedDB )
==

#### Define table structure

**extend class IndexedStorage.Table.Structure**

```typescript

class TestTable_Or_AnyOtherName extends IndexedStorage.Table.Structure {
	// primary key
	// use string if primary key is param of value object
	// empty string ("") if primary key is autoincrement
	// null or false if you set primary key manually
	public key:string = 'param1';

	// array of arrays of index fields ['field1', 'field2']
	public indexes:any[] = [['test', 'param']];
	// unique indexes
	public uniques:any[] = ['test', ['param']];
	// storage(table) name
	public name:string = 'test';
}
```

**and assign its instance with database name**

```typescript

// testdb - database name
IndexedStorage.Storage.factory( 'testdb' ).register( new TestTable_Or_AnyOtherName() );
```

**or**

```typescript

// factory( storage name, unique indexes, other indexes, primary key )
IndexedStorage.Storage.factory( 'testdb' ).register( IndexedStorage.Table.Structure.factory( 'test', [
		['test', 'param']
	], ['test', 'param'], 'param1' ) );
```

- if you need to change indexes - just change params ( changing primary key has no effect now)

- if you need to do something with database - add new function with unique(for storage) name as param of add

```typescript

IndexedStorage.Storage.factory( 'test' ).register( new TestTable_Or_AnyOtherName() ).changes().add( 'initial',function () {
	// do something
} ).add( 'second', function () {
	// do something else
} );
```


#### *OPEN* database

```typescript

// typescript
var databaseObject:IndexedStorage.Storage = IndexedStorage.Storage.factory( 'testdb' );
```

```javascript

//javascript
var databaseObject = IndexedStorage.Storage.factory( 'testdb' );
```

#### *SELECT*

```typescript

/* typescript */
// get record from testdb.test with primary key == 30
databaseObject.select( 'test' ).key( 30 ).each( function ( record:InternalStorage.Query.Record ) {
	console.log( 'found row', record.get() );
} );

// get records from testdb.test with value.test == 2
databaseObject.select( 'test' ).eq( 'test', 2 ).each( function ( record:InternalStorage.Query.Record ) {
	console.log( 'found row', record.get() );
} );

/* javacript */
// get records from testdb.test with value.test == 2 and value.param > "ccc"  and notinindex <= 20000
databaseObject.select( 'test' ).eq( 'test', 2 ).gt('param', 'ccc').ltoe('notinindex', 20000 ).each( function ( record ) {
	console.log( 'found row', record.get() );
} );

/* typescript */
// get records from testdb.test with value.test == 2 and value.param > "ccc" and value.x % 2 ( even )
databaseObject.select( 'test' ).eq( 'test', 2 ).gt('param', 'ccc').custom( function( record:InternalStorage.Query.Record ):boolean { return record.get().x % 2 == 0;  } ).each( function ( record:InternalStorage.Query.Record ) {
	console.log( 'found row', record.get() );
} );
```


#### *INSERT*

#### *UPDATE*

#### *DELETE*

#### *TRUNCATE*

