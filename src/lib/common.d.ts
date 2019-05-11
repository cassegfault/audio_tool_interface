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

declare interface EditorSelection {
    time_start: number,
    time_end: number,
    /** Indexed tracks containing arrays of selected clip indexes */
    track_selections: Array<Array<number>>
}