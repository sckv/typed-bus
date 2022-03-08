[Typed Bus](../README.md) / [Exports](../modules.md) / Transport

# Class: Transport

## Table of contents

### Constructors

- [constructor](Transport.md#constructor)

### Properties

- [consumers](Transport.md#consumers)
- [lastEvent](Transport.md#lastevent)
- [name](Transport.md#name)
- [ready](Transport.md#ready)
- [waitForReady](Transport.md#waitforready)

### Methods

- [\_publish](Transport.md#_publish)
- [\_startAsyncTransport](Transport.md#_startasynctransport)
- [addConsumer](Transport.md#addconsumer)
- [flushConsumers](Transport.md#flushconsumers)
- [publish](Transport.md#publish)
- [removeConsumer](Transport.md#removeconsumer)
- [startAsyncTransport](Transport.md#startasynctransport)
- [waitForTransportReadiness](Transport.md#waitfortransportreadiness)

## Constructors

### constructor

• **new Transport**()

#### Defined in

[engine/transport.ts:32](https://github.com/sckv/typed-bus/blob/de15eb5/src/engine/transport.ts#L32)

## Properties

### consumers

• **consumers**: [`ConsumerMethod`](../modules.md#consumermethod)[] = `[]`

#### Defined in

[engine/transport.ts:27](https://github.com/sckv/typed-bus/blob/de15eb5/src/engine/transport.ts#L27)

___

### lastEvent

• **lastEvent**: `undefined` \| [`Event`](Event.md)<`any`\>

#### Defined in

[engine/transport.ts:30](https://github.com/sckv/typed-bus/blob/de15eb5/src/engine/transport.ts#L30)

___

### name

• `Abstract` **name**: `string`

#### Defined in

[engine/transport.ts:25](https://github.com/sckv/typed-bus/blob/de15eb5/src/engine/transport.ts#L25)

___

### ready

• **ready**: `boolean` = `true`

#### Defined in

[engine/transport.ts:28](https://github.com/sckv/typed-bus/blob/de15eb5/src/engine/transport.ts#L28)

___

### waitForReady

• **waitForReady**: `boolean` = `false`

#### Defined in

[engine/transport.ts:29](https://github.com/sckv/typed-bus/blob/de15eb5/src/engine/transport.ts#L29)

## Methods

### \_publish

▸ `Optional` **_publish**(`event`): `Promise`<{ `orphanEvent?`: `boolean` ; `publishedConsumers`: `PromiseSettledResult`<`void`\>[]  }\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | [`Event`](Event.md)<`any`\> |

#### Returns

`Promise`<{ `orphanEvent?`: `boolean` ; `publishedConsumers`: `PromiseSettledResult`<`void`\>[]  }\>

#### Defined in

[engine/transport.ts:185](https://github.com/sckv/typed-bus/blob/de15eb5/src/engine/transport.ts#L185)

___

### \_startAsyncTransport

▸ `Optional` **_startAsyncTransport**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Defined in

[engine/transport.ts:184](https://github.com/sckv/typed-bus/blob/de15eb5/src/engine/transport.ts#L184)

___

### addConsumer

▸ **addConsumer**(`contract`, `fn`, `consumerId`, `hookId?`): `void`

Adds a consumer to the transport itself - internal method

#### Parameters

| Name | Type |
| :------ | :------ |
| `contract` | `Any` |
| `fn` | () => `any` |
| `consumerId` | `string` |
| `hookId?` | `string` |

#### Returns

`void`

#### Defined in

[engine/transport.ts:130](https://github.com/sckv/typed-bus/blob/de15eb5/src/engine/transport.ts#L130)

___

### flushConsumers

▸ **flushConsumers**(): `void`

Removes all consumers from this transport instance - internal method

#### Returns

`void`

#### Defined in

[engine/transport.ts:180](https://github.com/sckv/typed-bus/blob/de15eb5/src/engine/transport.ts#L180)

___

### publish

▸ **publish**(`event`): `Promise`<``null`` \| { `orphanEvent?`: `boolean` ; `publishedConsumers`: `PromiseSettledResult`<`void`\>[] ; `transport`: `string`  }\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | [`Event`](Event.md)<`any`\> |

#### Returns

`Promise`<``null`` \| { `orphanEvent?`: `boolean` ; `publishedConsumers`: `PromiseSettledResult`<`void`\>[] ; `transport`: `string`  }\>

#### Defined in

[engine/transport.ts:38](https://github.com/sckv/typed-bus/blob/de15eb5/src/engine/transport.ts#L38)

___

### removeConsumer

▸ **removeConsumer**(`consumerReference`): `void`

Removes the consumer from the transport - internal method

#### Parameters

| Name | Type |
| :------ | :------ |
| `consumerReference` | `string` \| (...`args`: `any`[]) => `any` |

#### Returns

`void`

#### Defined in

[engine/transport.ts:158](https://github.com/sckv/typed-bus/blob/de15eb5/src/engine/transport.ts#L158)

___

### startAsyncTransport

▸ **startAsyncTransport**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Defined in

[engine/transport.ts:172](https://github.com/sckv/typed-bus/blob/de15eb5/src/engine/transport.ts#L172)

___

### waitForTransportReadiness

▸ **waitForTransportReadiness**(): `Promise`<`undefined` \| { `orphanEvent`: `boolean` = false; `publishedConsumers`: `never`[] = []; `transport`: `string`  }\>

#### Returns

`Promise`<`undefined` \| { `orphanEvent`: `boolean` = false; `publishedConsumers`: `never`[] = []; `transport`: `string`  }\>

#### Defined in

[engine/transport.ts:105](https://github.com/sckv/typed-bus/blob/de15eb5/src/engine/transport.ts#L105)
