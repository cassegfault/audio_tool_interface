import { number } from "prop-types";

export function make_guid() {
    function gen() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return `${gen()}${gen()}-${gen()}-${gen()}-${gen()}-${gen()}${gen()}${gen()}`;
}

export function make_singleton(classObject, ctx) {
    if(classObject._instance) {
        return classObject._instance;
    }
    classObject._instance = ctx;
    return false;
}

export function isArray(obj) {
    if(objType(obj) === "array") {
        return Array.isArray(obj)
    }
    return false;
}

export function isObj(obj) {
    if(obj !== null && typeof obj === "object" && !Array.isArray(obj)){
        return true;
    }
    return false;
}

export function objType(obj) {
    var typeString = <string>toString.call(obj),
        typeArr = <string[]>typeString.replace(/[\[\]]/g,'').split(' ');

    if (typeArr.length > 1) {
        return typeArr[1].toLowerCase();
    }
    return "object";
}

export function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

export function samples_to_timestamp(sample_index: number, sample_rate: number = 44100, precision_timestamp:boolean = true) {
    var seconds = sample_index / sample_rate;

    return seconds_to_timestamp(seconds, precision_timestamp);
}

function left_pad(num: number, places: number) {
    var number_string = num.toString();
    while (number_string.length < places) {
        number_string = "0" + number_string;
    }
    return number_string;
}

/** Returns a string format of HH:MM:SS.mmm */
export function seconds_to_timestamp(seconds: number, precision_timestamp: boolean = true) {
    var milliseconds = seconds * 1000;
    
    var ms = 0,
        sec = 0,
        min = 0,
        hour = 0;
    
    if (milliseconds > 999) {
        ms = milliseconds % 1000;
        milliseconds = milliseconds / 1000;
        if (milliseconds > 59) {
            sec = milliseconds % 60;
            milliseconds = milliseconds / 60;
            if (milliseconds > 59) {
                min = milliseconds % 60;
                milliseconds = milliseconds / 60;
                hour = milliseconds;
            } else {
                min = milliseconds;
            }
        } else {
            sec = milliseconds;
        }
    } else {
        ms = milliseconds;
    }

    var normalize = (val: number, padding: number) => left_pad(Math.floor(val), padding),
        timestamp = precision_timestamp? normalize(ms, 3) : Math.round(ms / 100).toString();
    if (sec) {
        timestamp = `${normalize(sec, 2)}.` + timestamp;
    } else {
        timestamp = "00." + timestamp; 
    }
    if (min) {
        timestamp = `${normalize(min, 2)}:` + timestamp;
    } else if (precision_timestamp || hour) {
        timestamp = "00:" + timestamp; 
    }
    if (hour) {
        timestamp = `${normalize(hour, 2)}:` + timestamp;
    } else if (precision_timestamp) {
        timestamp = "00:" + timestamp; 
    }
    return timestamp;
}