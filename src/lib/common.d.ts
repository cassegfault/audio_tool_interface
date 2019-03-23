declare interface AudioFileProperites {
    name: string,
    size: number,
    lastModified: number,
    type: string,
    length: number,
    sample_rate: number
}
declare interface AudioFile {
    data: AudioBuffer;
    id: string;
    file?: AudioFileProperites;
}

/** Provides the additional properties built in to the proxy traps. For properties proxied in the state object */
type _ProxyProps<T> = T & {
    readonly __store_path__: string;
    set_property: (value_object: object) => void;
}

/** Proxied items are proxied all the way down the tree */
declare type Proxied<T> = _ProxyProps<T> & {
    readonly [P in keyof T]: Proxied<T[P]>;
}

declare interface EditorSelection {
    time_start: number,
    time_end: number,
    /** Indexed tracks containing arrays of selected clip indexes */
    track_selections: Array<Array<number>>
}