## Requirements of the interface


### Control

The API underlying the interface provides a wide array of highly parameterized functions. It is of some benefit to provide fine-grain control over these parameters in some instances, and in others to abstract them into a less complicated control system.

There is an expectation for the controls that interface with this function mimic real physical controls in some instances. While this interface is not set out to be an imitation of physical instrumentation, maintaining some of these paradigms is of great benefit.

One example is the parametric equalizer. Anyone who has worked with audio to one degree or another has encountered one of these and can quickly understand how to work it. The interface is almost always an immitation of a series of sliding potentiometers each controlling a set of frequencies presented in order of lowest to highest frequency. It would be of no benefit to break this paradigm.

Other interfaces, however, can present an opportunity for creativity and discovery when breaking from the paradigm. Reverb, for example, has abstracted parameters of 'wet' and 'dry'. These two parameters are related, but are almost universally presented as seperate controls on a physical interface due to the limitation of the medium. Presenting a wet/dry control as a location on a 2D plane offers quick control, is easy to understand, and encourages discovery.

### Display

Visualization is an important tool when working with audio as it allows for precision in editing. To work with audio without visualization precision is entirely reliant on the delay between the the audio being played, heard, and acted upon. Visualization does not have this dependency on time.

Displaying waveforms allows the editor to see when something starts or stops, whether it is a hard stop or a gradual fade, and many more properties of the audio data without ever having to play the clip. This can be a great productivity boost if the right information is presented quickly enough.

Simply displaying the audio data as a waveform is one thing, but there are many more visualization techniques available. For example, fourier transforms can provide a spectrograph providing information about the intensity across the frequency spectrum.

### State, Memory Management, and Routing

This tool will inevitably have a high memory footprint as it is a requirement of the platform to keep all of the audio data for the current workspace in memory. This is a benefit to the speed at which we can work with that audio, but may become untennable with larger workspaces.

For that reason it is necessary to have a state management system which serves as a point of truth for the audio data and all processes that use the data reference the data from the main controller so to prevent any unnecessary copying which will cause further memory footprint problems.

The primary memory controller should be relatively simple and can manage retrieving data from the server when necessary. There is some potential for offloading some of the memory to disk with future development of web APIs; having access to the audio data abstracted here will serve as a benefit when those opportunities arise.

Routing should be extremely simple and does not require many features. There will need to be some understanding of a parameterized path, but nothing complex. It is not worth spending the download and parse time on an extensive library here.

## Tooling

With a heavy emphasis on visualization and control, a very specific set of requirements for state management and light requirements for routing an entire web framework would be excessive. The view layer is the only layer that requires a complex implementation.

### Options for the view layer

The initial set of options were picked based on a few factors:

**A Mature / Stable API**
The API must be stable enough to not present breaking changes outside of major version updates. This will prevent unnecessary amounts of refactoring work as the application progresses.

**Minimal Footprint**
The memory footprint of the application will be large no matter what, it is a reasonable expectation of our view layer to be relatively small in memory and parse quickly.

**Typescript Support**
In order to maintain restrictions on memory usage and easily identify areas using incorrect types causing slowdown or excessive memory usage the project will use Typescript. Typescript support within the view layer can aid development, maintenance, and debugging time through specialized tooling.

**Fine-grain Reactivity Control**
View frameworks rerender specific parts of the dom based on state changes. Parts of the application are very expensive to re-render and this should only be done when absolutely necessary. It is important to performance to be able to have control in these situations.

With these factors in mind, the set of libraries examined are:

- [GlimmerJS](glimmerjs.com)
- [VueJS](vuejs.org)
- [React](reactjs.org)

### GlimmerJS

Glimmer is the view layer from [Ember](emberjs.com) separated into its own library. It is built around the Glimmer VM which uses stream processing to differentiate updates from the virtual DOM, deciding whether those updates need to be applied to the DOM or not. 

#### API

Glimmer is the view layer used within Ember, which requires the API to be extremely stable. It is also built and managed by the same team as Ember which has an exemplary reputation for deprecations and releases. As the Glimmer API is very new at the time of writing, however, the documentation is extremely minimal.

#### Footprint

Glimmer is the most lightweight of the options in terms of memory usage. Because it uses stream processing as opposed to keeping a full copy of the virtual DOM it has an incredibly small footprint. 

There are also some exciting possibilities in terms of its network usage as the Glimmer VM bytecode is being developed as an alternative to JSON for holding template data.

#### Typescript Support

Glimmer is written in Typescript and currently requires components be built in Typescript for its build process. Javascript is planned for support very soon. For the purposes of this application, requiring Typescript is acceptable.

#### Reactivity Control

By default, glimmer state is immutable and properties must be explicitly marked to be observed. While this approach may be a very appropriate approach for this project, in the infancy of the library it is missing features that cripple any application built with it.

A primary concern was that, at the time of writing, the only mutation observed of tracked properties is assignment. This means in order to update the state, you must assign the state. This becomes very cumbersome when working with arrays, as will be a common procedure in this application.

#### Summary

While glimmer is very promising in its speed, startup time, and level of control it is not yet at a point where it can be used at this scale without making some serious sacrfices in application structure. The API is still in its infancy lacking documentation for most methods and properties of the few classes that have been built. This is a significant indicator of problems that will occur in later development when the framework will need to be utilized to its fullest extent. It is preferable to go with a more mature library for this project.

### VueJS

Vue is a full featured framework which can be used as a view layer without requiring the other features. The benefits it provides are two way data binding, separation of concerns, and virtual DOM management similar to React in a very light bundle size. Vue supports typescript, but not native classes. They state that breaking changes will only occur where necessary and hint that they will only happen on version changes. Vue also manages state observation itself. The approach Vue uses is completely automated, all state is tracked and whether a component should be updated depends on the state that is changed.

The primary concern with Vue is two way data binding. There is much to be said on this topic in general, but for this specific case it is not something that is beneficial. It is important that state is changed in a very controlled manner. In the same vein, Vue's state observation is not preferable for this application as it is entirely automated.


### React

While React lacks some of the fine-grain controls of Glimmer, it is a much more robust and mature API. For this reason, it is possible to gain back much of that control. It lacks the efficiency of Glimmer's stream processing of the virtual DOM, requiring a the full virtual DOM to be in memory (at the time of writing there is work being put into React to move to a stream processing system).
