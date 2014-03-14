Indexed Storage
==

###IndexedDB

##plan and How to use

###ready

- **Define table structure**

```typescript

class TestTable_Or_AnyOtherName extends IndexedStorage.Table.Structure {
	public key:string = 'param1';
	public indexes:any[] = [['test', 'param']];
	public uniques:any[] = ['test', ['param']];
	public name:string = 'test';
}
```

**and assign it with database name**

```typescript

IndexedStorage.Storage.factory( 'test' ).register( new TestTable_Or_AnyOtherName() ).changes().add( 'initial',function () {
	// do something
} ).add( 'second', function () {
   // do something else
} );
```


**or**

```typescript

IndexedStorage.Storage.factory( 'test' ).register( IndexedStorage.Table.Structure.factory( 'test', [
		['test', 'param']
	], ['test', 'param'], 'param1' ) ).changes().add( 'initial',function () {
	// do something
} ).add( 'second', function () {
   // do something else
} );
```

-

*in progress*

