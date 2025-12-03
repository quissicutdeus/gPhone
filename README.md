<div align="center">
    <img href="https://projecterror.dev" width="150" src="https://i.tasoagc.dev/c1pD" alt="Material-UI logo" />
</div>
<h1 align="center">gPhone</h1>

<div align="center">
This is an open-source TypeScript phone, in FiveM.
</div>

## Requirements
* Node > v24
pnpm

## Getting Started

First clone the repository or use the template option 
and place it within your `resources` folder

**Install Dependencies**

Navigate into the newly cloned folder and execute
the following command, to install dependencies.

```sh
pnpm install
```

## Development

### Hot Building

While developing your resource, we offer a few `watch` scripts
that will automatically hot rebuild on any change within the
`client`/`server` or `web` directories.

```sh
pnpm watch
pnpm watch:web
```
*This script still requires you restart the resource for the
changes to be reflected in-game*

### Entry Points
**Client** - `./client/client.ts`

**Server** - `./server/server.ts`

## Production Build
Once you have completed the development phase of your resource,
you must create an optimized & minimized production build, using
the `build` script.

```sh
pnpm build
```
### Automatic Builds (Optional)

*This is not recommended as the embedded version of yarn is 
ocassionally prone to performance and environment problems. We 
highly recomend, you manually run the build script*

If desired, the `fxmanifest.lua` can be setup to allow for
FXServer to automatically build on resource start. This utilizes
the embedded `yarn` & `webpack` default resources.

To enable this, add the following to your `fxmanifest.lua`

```lua
dependency {
    'pnpm',
    'webpack'
}

webpack_config 'webpack.config.js'
```
