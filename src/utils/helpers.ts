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