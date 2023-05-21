# next-api-context

Next API Context is a Typescript library designed to make validating incoming data and executing middleware on a per-handler basis simpler.

## Installation

TODO - package is not yet published

## Usage

```ts
export const POST = withRequestContext(
  {
    validation: {
      body: z.object({
        name: z.string(),
        age: z.number(),
      }),
      query: z.object({
        lang: z.enum(["en", "fr"]),
      }),
    },
  },
  // req is the original request object and should not have any mutations or type information
  async (req, ctx) => {
    // Name and age are now strongly typed and will conform to the above Zod schema
    // ctx.body.name has type string
    // ctx.body.age has type number
    // ctx.query.lang has type "en" | "fr"
    const {
      body: { name, age },
      query: { lang },
    } = ctx;
    return NextResponse.json({
      greeting: `Hello, ${name}!`,
      age: `You are ${age} years old!`,
      language: `Your language is ${lang}`,
    });
  }
);

```

## Should you use this?
Not right now, this is just an initial implementation and breaking changes will be introduced while the initial functionality is built.

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Ideas and requests for features are also welcome, please open an issue to discuss.

## License

[MIT](https://choosealicense.com/licenses/mit/)
