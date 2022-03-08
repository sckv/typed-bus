[Typed Bus](README.md) / Exports

# Typed Bus

## Table of contents

### Classes

- [DumpController](classes/DumpController.md)
- [Event](classes/Event.md)
- [Transport](classes/Transport.md)

### Type aliases

- [ConsumerMethod](modules.md#consumermethod)

### Variables

- [TypedBus](modules.md#typedbus)
- [context](modules.md#context)

### Functions

- [Consume](modules.md#consume)

## Type aliases

### ConsumerMethod

Ƭ **ConsumerMethod**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `contract` | `iots.Any` |
| `id` | `string` |
| `matchEvent` | `MatchEvent` |
| `exec` | (...`args`: `any`[]) => `any` |

#### Defined in

[engine/transport.ts:11](https://github.com/sckv/typed-bus/blob/de15eb5/src/engine/transport.ts#L11)

## Variables

### TypedBus

• `Const` **TypedBus**: `TypedBusClass`

#### Defined in

[engine/instance.ts:4](https://github.com/sckv/typed-bus/blob/de15eb5/src/engine/instance.ts#L4)

___

### context

• `Const` **context**: `Context`

#### Defined in

[context/context.ts:15](https://github.com/sckv/typed-bus/blob/de15eb5/src/context/context.ts#L15)

## Functions

### Consume

▸ **Consume**<`I`\>(`contract`, `options?`): (`target`: `any`, `_propertyName`: `string`, `propertyDescriptor`: `PropertyDescriptor`) => `PropertyDescriptor`

Decorator `@Consume(contract, combine?: { with, name })`.
Consumes an event that matches the io-ts type.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `I` | extends `Any`<`I`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `contract` | `I` |
| `options` | `Object` |
| `options.combine?` | `Object` |
| `options.combine.name` | `string` |
| `options.combine.with` | `Any` |
| `options.listenTo?` | `string`[] |

#### Returns

`fn`

▸ (`target`, `_propertyName`, `propertyDescriptor`): `PropertyDescriptor`

##### Parameters

| Name | Type |
| :------ | :------ |
| `target` | `any` |
| `_propertyName` | `string` |
| `propertyDescriptor` | `PropertyDescriptor` |

##### Returns

`PropertyDescriptor`

#### Defined in

[decorators/consume.ts:11](https://github.com/sckv/typed-bus/blob/de15eb5/src/decorators/consume.ts#L11)
