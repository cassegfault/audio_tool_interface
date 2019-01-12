export interface AudioFile {
    data: AudioBuffer;
    id: string;
    file?: { name: string, size: number, lastModified: number, type: string, length: number, sample_rate: number };
}

/** Provides the additional properties built in to the proxy traps. For properties proxied in the state object */
export type Proxied<T> = T & {
    __store_path__: Readonly<string>;
    set_property: (value_object: object) => void;
}

