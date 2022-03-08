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

[engine/transport.ts:32](https://github.com/sckv/typed-bus/blob/07037da/src/engine/transport.ts#L32)

## Properties

### consumers

• **consumers**: [`ConsumerMethod`](../modules.md#consumermethod)[] = `[]`

#### Defined in

[engine/transport.ts:27](https://github.com/sckv/typed-bus/blob/07037da/src/engine/transport.ts#L27)

___

### lastEvent

• **lastEvent**: `undefined` \| [`Event`](Event.md)<`any`\>

#### Defined in

[engine/transport.ts:30](https://github.com/sckv/typed-bus/blob/07037da/src/engine/transport.ts#L30)

___

### name

• `Abstract` **name**: `string`

#### Defined in

[engine/transport.ts:25](https://github.com/sckv/typed-bus/blob/07037da/src/engine/transport.ts#L25)

___

### ready

• **ready**: `boolean` = `true`

#### Defined in

[engine/transport.ts:28](https://github.com/sckv/typed-bus/blob/07037da/src/engine/transport.ts#L28)

___

### waitForReady

• **waitForReady**: `boolean` = `false`

#### Defined in

[engine/transport.ts:29](https://github.com/sckv/typed-bus/blob/07037da/src/engine/transport.ts#L29)

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

[engine/transport.ts:176](https://github.com/sckv/typed-bus/blob/07037da/src/engine/transport.ts#L176)

___

### \_startAsyncTransport

▸ `Optional` **_startAsyncTransport**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Defined in

[engine/transport.ts:175](https://github.com/sckv/typed-bus/blob/07037da/src/engine/transport.ts#L175)

___

### addConsumer

▸ **addConsumer**(`contract`, `fn`, `consumerId`, `hookId?`): `void`

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

[engine/transport.ts:127](https://github.com/sckv/typed-bus/blob/07037da/src/engine/transport.ts#L127)

___

### flushConsumers

▸ **flushConsumers**(): `void`

#### Returns

`void`

#### Defined in

[engine/transport.ts:171](https://github.com/sckv/typed-bus/blob/07037da/src/engine/transport.ts#L171)

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

[engine/transport.ts:38](https://github.com/sckv/typed-bus/blob/07037da/src/engine/transport.ts#L38)

___

### removeConsumer

▸ **removeConsumer**(`consumerReference`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `consumerReference` | `string` \| (...`args`: `any`[]) => `any` |

#### Returns

`void`

#### Defined in

[engine/transport.ts:152](https://github.com/sckv/typed-bus/blob/07037da/src/engine/transport.ts#L152)

___

### startAsyncTransport

▸ **startAsyncTransport**(): `Promise`<`void`\>

#### Returns

`Promise`<`void`\>

#### Defined in

[engine/transport.ts:166](https://github.com/sckv/typed-bus/blob/07037da/src/engine/transport.ts#L166)

___

### waitForTransportReadiness

▸ **waitForTransportReadiness**(): `Promise`<`undefined` \| { `orphanEvent`: `boolean` = false; `publishedConsumers`: `never`[] = []; `transport`: `string`  }\>

#### Returns

`Promise`<`undefined` \| { `orphanEvent`: `boolean` = false; `publishedConsumers`: `never`[] = []; `transport`: `string`  }\>

#### Defined in

[engine/transport.ts:105](https://github.com/sckv/typed-bus/blob/07037da/src/engine/transport.ts#L105)
