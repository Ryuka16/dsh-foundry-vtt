# Scene Transitions

![Latest Release Download Count](https://img.shields.io/github/downloads/p4535992/foundryvtt-scene-transitions/latest/module.zip?color=2b82fc&label=DOWNLOADS&style=for-the-badge)

[![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Fscene-transitions&colorB=006400&style=for-the-badge)](https://forge-vtt.com/bazaar#package=scene-transitions)

![Foundry Core Compatible Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2Fp4535992%2Ffoundryvtt-scene-transitions%2Fmaster%2Fsrc%2Fmodule.json&label=Foundry%20Version&query=$.compatibility.verified&colorB=orange&style=for-the-badge)

![Latest Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2Fp4535992%2Ffoundryvtt-scene-transitions%2Fmaster%2Fsrc%2Fmodule.json&label=Latest%20Release&prefix=v&query=$.version&colorB=red&style=for-the-badge)

[![Foundry Hub Endorsements](https://img.shields.io/endpoint?logoColor=white&url=https%3A%2F%2Fwww.foundryvtt-hub.com%2Fwp-json%2Fhubapi%2Fv1%2Fpackage%2Fscene-transitions%2Fshield%2Fendorsements&style=for-the-badge)](https://www.foundryvtt-hub.com/package/scene-transitions/)

![GitHub all releases](https://img.shields.io/github/downloads/p4535992/foundryvtt-scene-transitions/total?style=for-the-badge)

[![Translation status](https://weblate.foundryvtt-hub.com/widgets/scene-transitions/-/287x66-black.png)](https://weblate.foundryvtt-hub.com/engage/scene-transitions/)

### If you want to buy me a coffee [![alt-text](https://img.shields.io/badge/-Patreon-%23ff424d?style=for-the-badge)](https://www.patreon.com/p4535992) or better give something to Larkinabout [![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/larkinabout) for many bug fixing.

Allows GM to make simple transitions to show players before navigating to new screen. Can be used for narrative effect. Can now be used with macros to create transitionless Transitions. And journal entries can now be used to generate a Transition.

![img1](/wiki/img/scene_transations_video.gif)

![img2](/wiki/img/preview.png)

![img3](/wiki/img/preview2.png)


## NOTE: This module is **under maintenance**, I have no plans to update or add features. However, I will try to fix any bugs as possible. Any contribution is welcome.

## NOTE: IF YOU NEED THE FOUNDRYVTT 9 PROJECT you can install the last verified release for 9 here: https://raw.githubusercontent.com/DM-miX/scene-transitions/master/module.json

## Installation

It's always easiest to install modules from the in game add-on browser.

To install this module manually:
1.  Inside the Foundry "Configuration and Setup" screen, click "Add-on Modules"
2.  Click "Install Module"
3.  In the "Manifest URL" field, paste the following url:
`https://raw.githubusercontent.com/p4535992/foundryvtt-scene-transitions/master/src/module.json`
4.  Click 'Install' and wait for installation to complete
5.  Don't forget to enable the module in game using the "Manage Module" button

### socketLib

This module uses the [socketLib](https://github.com/manuelVo/foundryvtt-socketlib) library like a dependency. It is a hard dependency and it is recommended for the best experience and compatibility with other modules.


## Known Issue\Limitation

## Feature

Use the context menu on the navigator or directory to 'Create Transition'

Add background image, text, and configure to your liking and save. When you want to play it, bring up context menu and press 'Play Transition' 

Transition will play and begin preloading scene. Scene will activate underneath transition. 

Use the textbox sourcecode editor to add custom html and override default css.


## Api

**NOTE:** From fvtt 9 to fvtt 10 the old macro `Transition.macro(options, showMe)` is been replaced with `game.modules.get('scene-transitions').api.macro(options, showMe)`

```javascript
game.modules.get('scene-transitions').api.macro({
	sceneID: false, // To play a transition without a scene activation, simple pass `false` as the sceneID in the data object or use the string id of the scene.
	content:"TEST MACRO",
	fontColor:'#ffffff',
	fontSize: 28,
	bgImg:'', // pass any relative or absolute image or video url here.
	bgPos:'center center',
    bgLoop: true, // Only for VIDEO, if true will loop the video
	bgMuted: true, // Only for VIDEO, if true will play the video muted
	bgSize:'cover',
	bgColor:'#333333',
	bgOpacity:0.7,
	fadeIn: 400, //how long to fade in
	delay:5000, //how long for transition to stay up
	fadeOut: 400, //how long to fade out
	audio: "", //path to audio file, NOTE: is not advisable to use this with a video and the property 'bgMuted = false'
	allowPlayersToEnd:true, //Allows players to skip transition with a click before delay runs out.
    audioLoop: true, //Loop the audio file ?
	gmHide: true, // hide the transition on other windows logged in as a GM
	gmEndAll: true, // when the GM clicks to end the transition - end for everyone
	showUI: false, // Show the User Interface elements to all players allowing them to interact with character sheets etc
	activateScene: false, // Activate the scene when play the transation ?
	fromSocket: false, // This is usually a application variable for manage socket calls YOU DIDN'T NEED TO TOUCH THIS, MUST BE ALWAYS FALSE.
	users: [], // show the transaction to this list of users ids, NOTE: if 'showMe' is true the current user id is add to the list
}, true ); // show to the triggering user (the one who click to the macro usually the GM)
```

**NOTE:** To play a transition without a scene activation, simple pass `false` as the sceneID in the data object.

# Build

## Install all packages

```bash
npm install
```

### dev

`dev` will let you develop you own code with hot reloading on the browser

```bash
npm run dev
```

### build

`build` will build and set up a symlink between `dist` and your `dataPath`.

```bash
npm run build
```

### build:watch

`build:watch` will build and watch for changes, rebuilding automatically.

```bash
npm run build:watch
```

### prettier-format

`prettier-format` launch the prettier plugin based on the configuration [here](./.prettierrc)

```bash
npm run-script prettier-format
```

### lint

`lint` launch the eslint process based on the configuration [here](./.eslintrc.json)

```bash
npm run-script lint
```

### lint:fix

`lint:fix` launch the eslint process with the fix argument

```bash
npm run-script lint:fix
```

### build:json

`build:json` unpack LevelDB pack on `src/packs` to the json db sources in `src/packs/_source`very useful for backup your items and manually fix some hard issue with some text editor

```bash
npm run-script build:json
```

### build:clean

`build:clean` clean packs json sources in `src/packs/_source`. NOTE: usually this command is launched after the command `build:json` and after make some modifications on the json source files with some text editor, but before the `build:db`

```bash
npm run-script build:clean
```

### build:db

`build:db` packs the json db sources in `src/packs/_source` to LevelDB pack on `src/packs` with the new jsons. NOTE: usually this command is launched after the command `build:json` and after make some modifications on the json source files with some text editor

```bash
npm run-script build:db
```

## [Changelog](./CHANGELOG.md)

## Issues

Any issues, bugs, or feature requests are always welcome to be reported directly to the [Issue Tracker](https://github.com/p4535992/foundryvtt-scene-transitions/issues ), or using the [Bug Reporter Module](https://foundryvtt.com/packages/bug-reporter/).

## License

This package is under an [MIT license](LICENSE) and the [Foundry Virtual Tabletop Limited License Agreement for module development](https://foundryvtt.com/article/license/).

## Credit

Thanks to anyone who helps me with this code! I appreciate the user community's feedback on this project!

