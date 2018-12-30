import { AudioFile } from "../common"
import AudioTrack from "./AudioTrack";
import AudioClip from "./AudioClip";
import { AudioInterface, audioInterface } from "./AudioInterface";






/*
    each track is held in memory
    each track has an audiobuffersource node, additional references to this clip get new nodes

    Files are raw audio data
    Tracks are linear sequences that contain a series of clips
        Tracks can be balanced left or right
        Volume adjusted for all clips
        Can have effects
    Clips are references to sections of files
        Can have effects
        Can adjust volume
    
    Something that will definitely be necessary is undo/redo. This needs to be implemented from the start,
    otherwise the code would need to be thoroughly refactored in the future.
    The pattern I'll be using is a stack of mutations. The state will be considered immutable,
    and the mutation stack will define the current state. Each mutation will store a before and after value,
    to make reverting mutations very easy.
    
    Editor state looks like:
    Editor {
        Files: []
        Tracks [{
            Clips [{
                track_position,
                file_start,
                file_stop

            }]
        }]
    }

    I need to as abstractly as possible have each of these constructs track their mutations.
    I think the action / mutation
    
    I would like the state system to be modularized

*/

export { AudioTrack, AudioFile, AudioClip, AudioInterface, audioInterface };