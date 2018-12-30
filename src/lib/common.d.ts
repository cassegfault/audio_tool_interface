export interface AudioFile {
    data: AudioBuffer;
    id: string;
    file?: { name: string, size: number, lastModified: number, type: string, length: number };
}

