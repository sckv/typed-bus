[Typed Bus](../README.md) / [Exports](../modules.md) / DumpController

# Class: DumpController

## Table of contents

### Constructors

- [constructor](DumpController.md#constructor)

### Properties

- [injectedStore](DumpController.md#injectedstore)
- [timeout](DumpController.md#timeout)

### Methods

- [attachGracefulHandlers](DumpController.md#attachgracefulhandlers)
- [clearTimeout](DumpController.md#cleartimeout)
- [dump](DumpController.md#dump)
- [dumpMultiple](DumpController.md#dumpmultiple)
- [dumpMultipleEvents](DumpController.md#dumpmultipleevents)
- [dumpSingleEvents](DumpController.md#dumpsingleevents)
- [executeDumpOperation](DumpController.md#executedumpoperation)
- [injectStore](DumpController.md#injectstore)
- [launchTimer](DumpController.md#launchtimer)

## Constructors

### constructor

• **new DumpController**(`interval?`, `mode?`)

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `interval` | `number` | `5000` |
| `mode` | ``"single"`` \| ``"multiple"`` | `MODE.SINGLE` |

#### Defined in

engine/dump-controller.ts:12

## Properties

### injectedStore

• `Optional` **injectedStore**: `EventsStore`

#### Defined in

engine/dump-controller.ts:9

___

### timeout

• `Optional` **timeout**: `Timeout`

#### Defined in

engine/dump-controller.ts:10

## Methods

### attachGracefulHandlers

▸ `Private` **attachGracefulHandlers**(): `void`

#### Returns

`void`

#### Defined in

engine/dump-controller.ts:56

___

### clearTimeout

▸ **clearTimeout**(): `void`

#### Returns

`void`

#### Defined in

engine/dump-controller.ts:52

___

### dump

▸ `Abstract` **dump**(`event`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `Object` |

#### Returns

`Promise`<`void`\>

#### Defined in

engine/dump-controller.ts:74

___

### dumpMultiple

▸ `Optional` **dumpMultiple**(`events`): `Promise`<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `events` | { `[k: string]`: `any`;  }[] |

#### Returns

`Promise`<`void`\>

#### Defined in

engine/dump-controller.ts:75

___

### dumpMultipleEvents

▸ **dumpMultipleEvents**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Defined in

engine/dump-controller.ts:38

___

### dumpSingleEvents

▸ **dumpSingleEvents**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Defined in

engine/dump-controller.ts:28

___

### executeDumpOperation

▸ **executeDumpOperation**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Defined in

engine/dump-controller.ts:16

___

### injectStore

▸ **injectStore**(`store`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `store` | `EventsStore` |

#### Returns

`void`

#### Defined in

engine/dump-controller.ts:44

___

### launchTimer

▸ **launchTimer**(): `void`

#### Returns

`void`

#### Defined in

engine/dump-controller.ts:48
