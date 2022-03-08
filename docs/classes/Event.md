[Typed Bus](../README.md) / [Exports](../modules.md) / Event

# Class: Event<T\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `any` |

## Table of contents

### Constructors

- [constructor](Event.md#constructor)

### Properties

- [executionId](Event.md#executionid)
- [hookId](Event.md#hookid)
- [hookIdStale](Event.md#hookidstale)
- [orphanTransports](Event.md#orphantransports)
- [payload](Event.md#payload)
- [publishedTransports](Event.md#publishedtransports)
- [timestamp](Event.md#timestamp)
- [uuid](Event.md#uuid)

### Methods

- [addOrphanTransport](Event.md#addorphantransport)
- [addPublishedTransport](Event.md#addpublishedtransport)
- [equals](Event.md#equals)
- [getHook](Event.md#gethook)
- [getUniqueStamp](Event.md#getuniquestamp)
- [isAfter](Event.md#isafter)
- [isBefore](Event.md#isbefore)
- [payloadEquals](Event.md#payloadequals)
- [setExecutionId](Event.md#setexecutionid)
- [setHookIdStale](Event.md#sethookidstale)
- [toFullEvent](Event.md#tofullevent)
- [toJSON](Event.md#tojson)
- [create](Event.md#create)

## Constructors

### constructor

• `Private` **new Event**<`T`\>(`payload`, `hook?`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `any` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload` | `any` |
| `hook?` | `boolean` |

#### Defined in

[engine/event.ts:28](https://github.com/sckv/typed-bus/blob/de15eb5/src/engine/event.ts#L28)

## Properties

### executionId

• `Optional` **executionId**: `string`

#### Defined in

[engine/event.ts:22](https://github.com/sckv/typed-bus/blob/de15eb5/src/engine/event.ts#L22)

___

### hookId

• `Optional` **hookId**: `string`

#### Defined in

[engine/event.ts:19](https://github.com/sckv/typed-bus/blob/de15eb5/src/engine/event.ts#L19)

___

### hookIdStale

• **hookIdStale**: `boolean` = `false`

#### Defined in

[engine/event.ts:20](https://github.com/sckv/typed-bus/blob/de15eb5/src/engine/event.ts#L20)

___

### orphanTransports

• `Optional` **orphanTransports**: `CustomSet`<`string`\>

#### Defined in

[engine/event.ts:25](https://github.com/sckv/typed-bus/blob/de15eb5/src/engine/event.ts#L25)

___

### payload

• **payload**: `T`

#### Defined in

[engine/event.ts:24](https://github.com/sckv/typed-bus/blob/de15eb5/src/engine/event.ts#L24)

___

### publishedTransports

• `Optional` **publishedTransports**: `CustomSet`<`string`\>

#### Defined in

[engine/event.ts:26](https://github.com/sckv/typed-bus/blob/de15eb5/src/engine/event.ts#L26)

___

### timestamp

• **timestamp**: `number`

#### Defined in

[engine/event.ts:23](https://github.com/sckv/typed-bus/blob/de15eb5/src/engine/event.ts#L23)

___

### uuid

• **uuid**: `string`

#### Defined in

[engine/event.ts:18](https://github.com/sckv/typed-bus/blob/de15eb5/src/engine/event.ts#L18)

## Methods

### addOrphanTransport

▸ **addOrphanTransport**(`transport`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `transport` | `string` |

#### Returns

`void`

#### Defined in

[engine/event.ts:90](https://github.com/sckv/typed-bus/blob/de15eb5/src/engine/event.ts#L90)

___

### addPublishedTransport

▸ **addPublishedTransport**(`transport`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `transport` | `string` |

#### Returns

`void`

#### Defined in

[engine/event.ts:95](https://github.com/sckv/typed-bus/blob/de15eb5/src/engine/event.ts#L95)

___

### equals

▸ **equals**(`to`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `to` | [`Event`](Event.md)<`any`\> |

#### Returns

`boolean`

#### Defined in

[engine/event.ts:59](https://github.com/sckv/typed-bus/blob/de15eb5/src/engine/event.ts#L59)

___

### getHook

▸ **getHook**(`hook?`): `undefined` \| `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `hook?` | `boolean` |

#### Returns

`undefined` \| `string`

#### Defined in

[engine/event.ts:44](https://github.com/sckv/typed-bus/blob/de15eb5/src/engine/event.ts#L44)

___

### getUniqueStamp

▸ **getUniqueStamp**(`transport?`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `transport?` | `string` |

#### Returns

`string`

#### Defined in

[engine/event.ts:55](https://github.com/sckv/typed-bus/blob/de15eb5/src/engine/event.ts#L55)

___

### isAfter

▸ **isAfter**(`event`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | [`Event`](Event.md)<`any`\> |

#### Returns

`boolean`

#### Defined in

[engine/event.ts:74](https://github.com/sckv/typed-bus/blob/de15eb5/src/engine/event.ts#L74)

___

### isBefore

▸ **isBefore**(`event`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | [`Event`](Event.md)<`any`\> |

#### Returns

`boolean`

#### Defined in

[engine/event.ts:70](https://github.com/sckv/typed-bus/blob/de15eb5/src/engine/event.ts#L70)

___

### payloadEquals

▸ **payloadEquals**(`to`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `to` | [`Event`](Event.md)<`any`\> |

#### Returns

`boolean`

#### Defined in

[engine/event.ts:64](https://github.com/sckv/typed-bus/blob/de15eb5/src/engine/event.ts#L64)

___

### setExecutionId

▸ **setExecutionId**(`executionId`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `executionId` | `string` |

#### Returns

`void`

#### Defined in

[engine/event.ts:40](https://github.com/sckv/typed-bus/blob/de15eb5/src/engine/event.ts#L40)

___

### setHookIdStale

▸ **setHookIdStale**(): `void`

#### Returns

`void`

#### Defined in

[engine/event.ts:86](https://github.com/sckv/typed-bus/blob/de15eb5/src/engine/event.ts#L86)

___

### toFullEvent

▸ **toFullEvent**(): [`Event`](Event.md)<`T`\>

#### Returns

[`Event`](Event.md)<`T`\>

#### Defined in

[engine/event.ts:82](https://github.com/sckv/typed-bus/blob/de15eb5/src/engine/event.ts#L82)

___

### toJSON

▸ **toJSON**(): `T`

#### Returns

`T`

#### Defined in

[engine/event.ts:78](https://github.com/sckv/typed-bus/blob/de15eb5/src/engine/event.ts#L78)

___

### create

▸ `Static` **create**<`T`\>(`payload`, `hook?`): [`Event`](Event.md)<`T`\>

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `payload` | `T` |
| `hook?` | `boolean` |

#### Returns

[`Event`](Event.md)<`T`\>

#### Defined in

[engine/event.ts:100](https://github.com/sckv/typed-bus/blob/de15eb5/src/engine/event.ts#L100)
