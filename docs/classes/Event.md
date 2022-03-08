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
- [setHookIdStale](Event.md#sethookidstale)
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

[engine/event.ts:20](https://github.com/sckv/typed-bus/blob/07037da/src/engine/event.ts#L20)

## Properties

### hookId

• `Optional` **hookId**: `string`

#### Defined in

[engine/event.ts:13](https://github.com/sckv/typed-bus/blob/07037da/src/engine/event.ts#L13)

___

### hookIdStale

• **hookIdStale**: `boolean` = `false`

#### Defined in

[engine/event.ts:14](https://github.com/sckv/typed-bus/blob/07037da/src/engine/event.ts#L14)

___

### orphanTransports

• `Optional` **orphanTransports**: `Set`<`string`\>

#### Defined in

[engine/event.ts:17](https://github.com/sckv/typed-bus/blob/07037da/src/engine/event.ts#L17)

___

### payload

• **payload**: `T`

#### Defined in

[engine/event.ts:16](https://github.com/sckv/typed-bus/blob/07037da/src/engine/event.ts#L16)

___

### publishedTransports

• `Optional` **publishedTransports**: `Set`<`string`\>

#### Defined in

[engine/event.ts:18](https://github.com/sckv/typed-bus/blob/07037da/src/engine/event.ts#L18)

___

### timestamp

• **timestamp**: `number`

#### Defined in

[engine/event.ts:15](https://github.com/sckv/typed-bus/blob/07037da/src/engine/event.ts#L15)

___

### uuid

• **uuid**: `string`

#### Defined in

[engine/event.ts:12](https://github.com/sckv/typed-bus/blob/07037da/src/engine/event.ts#L12)

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

[engine/event.ts:74](https://github.com/sckv/typed-bus/blob/07037da/src/engine/event.ts#L74)

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

[engine/event.ts:79](https://github.com/sckv/typed-bus/blob/07037da/src/engine/event.ts#L79)

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

[engine/event.ts:47](https://github.com/sckv/typed-bus/blob/07037da/src/engine/event.ts#L47)

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

[engine/event.ts:32](https://github.com/sckv/typed-bus/blob/07037da/src/engine/event.ts#L32)

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

[engine/event.ts:43](https://github.com/sckv/typed-bus/blob/07037da/src/engine/event.ts#L43)

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

[engine/event.ts:62](https://github.com/sckv/typed-bus/blob/07037da/src/engine/event.ts#L62)

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

[engine/event.ts:58](https://github.com/sckv/typed-bus/blob/07037da/src/engine/event.ts#L58)

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

[engine/event.ts:52](https://github.com/sckv/typed-bus/blob/07037da/src/engine/event.ts#L52)

___

### setHookIdStale

▸ **setHookIdStale**(): `void`

#### Returns

`void`

#### Defined in

[engine/event.ts:70](https://github.com/sckv/typed-bus/blob/07037da/src/engine/event.ts#L70)

___

### toJSON

▸ **toJSON**(): `T`

#### Returns

`T`

#### Defined in

[engine/event.ts:66](https://github.com/sckv/typed-bus/blob/07037da/src/engine/event.ts#L66)

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

[engine/event.ts:84](https://github.com/sckv/typed-bus/blob/07037da/src/engine/event.ts#L84)
