import { warn, debug } from "utils/console";
import { string } from "prop-types";

// These are functionally just aliases but keep the code explicit
type KeyCode = number;
const Modifiers: { [key: number]: string; } = {
    16: "shift",
    17: "ctrl",
    18: "alt",
    91: "cmd"
}
const ModifierMap = Object.keys(Modifiers).reduce((pv, code) => {
    pv[Modifiers[code]] = code;
    return pv;
}, {});

const NamedKeys: { [key: number]: string; } = {
    8: "delete",
    9: "tab",
    13: "enter",
    37: "left",
    38: "up",
    39: "right",
    40: "down",
    112: "f1",
    113: "f2",
    114: "f3",
    115: "f4",
    116: "f5",
    117: "f6",
    118: "f7",
    119: "f8",
    120: "f9",
    121: "f10",
    122: "f11",
    123: "f12",
}
const NamedKeyMap = Object.keys(NamedKeys).reduce((pv, code) => {
    pv[NamedKeys[code]] = code;
    return pv;
}, {});

// this is some typescript nonsense, can't extend built-in types
type ObjectAlias = object;
interface Bindings extends ObjectAlias {
    [combo: string]: (e: KeyboardEvent) => void;
}

interface HotkeyOptions {
    /** The character between hotkeys in the combo string. Default is '+' */
    combiner?: string;
}

class HotkeyManager {
    //!- singleton logic
    private static _instance: HotkeyManager = new HotkeyManager();
    private constructor() {
        // Decide if we're creating an instance or not
        if (HotkeyManager._instance) {
            return HotkeyManager._instance;
        }
        HotkeyManager._instance = this;
    }

    public static getInstance() {
        return HotkeyManager._instance;
    }
    //-!

    activeModifiers: Set<KeyCode> = new Set();
    activeKeys: Set<KeyCode> = new Set();
    private bindings: Bindings = null;
    private combiner: string = '+';
    private is_bound: boolean = false;

    /**
     * Required setup for listening to any changes in keyboard state
     * @param bindings A map of key combinations to callback functions
     * @param options Hotkey initialization options
     */
    initialize(bindings: Bindings, options?: HotkeyOptions) {
        if (!this.is_bound) {
            document.addEventListener('keydown', this.keydown.bind(this));
            document.addEventListener('keyup', this.keyup.bind(this));
            this.is_bound = true;
        }

        // normalize
        this.bindings = Object.keys(bindings).reduce((map, key) => {
            map[this.normalize_combo(key)] = bindings[key];
            return map;
        }, {});
        if (options) {
            this.combiner = options.combiner || this.combiner;
        }
    }

    private normalize_combo(combo: string) {
        return this.build_combo_string(this.parse_combo_string(combo));
    }

    private parse_combo_string(combo: string): Array<KeyCode> {
        const parts = combo.split('+').map(str => {
            str = str.trim();
            if (str.length > 1) {
                str = str.toLowerCase();
                var modifierCode: number = ModifierMap[str],
                    namedKeyCode: number = NamedKeyMap[str];
                if (!modifierCode && !namedKeyCode)
                    return -1;
                return modifierCode || namedKeyCode;
            } else if (str.length === 1) {
                return str.toUpperCase().charCodeAt(0);
            } else {
                return -1;
            }
        });

        if (parts.indexOf(-1) > -1) {
            warn(`Unsupported Key Combination: ${combo}`);
            return [];
        }

        // Sort to maintain consistent ordering
        return parts.sort((a, b) => a - b);
    }

    private build_combo_string(keys: Array<KeyCode>): string {
        return keys.sort((a, b) => a - b).map((key) => {
            if (key in Modifiers) {
                return Modifiers[key];
            } else if (key in NamedKeys) {
                return NamedKeys[key];
            } else {
                return String.fromCharCode(key);
            }
        }).join(this.combiner);
    }

    private keydown(e: KeyboardEvent) {
        const key: KeyCode = e.keyCode;
        if (Modifiers.hasOwnProperty(key)) {
            this.activeModifiers.add(key);
        } else {
            this.activeKeys.add(key);
        }

        if (!this.bindings)
            return;


        // build combo string
        var combo: Array<KeyCode> = [],
            combo_str = '';
        for (let mod of this.activeModifiers) {
            combo.push(mod);
        }
        for (let key of this.activeKeys) {
            combo.push(key);
        }

        if (combo.length < 1)
            return;

        combo_str = this.build_combo_string(combo);
        if (this.bindings.hasOwnProperty(combo_str)) {
            this.bindings[combo_str](e);
        }
    }

    private keyup(e: KeyboardEvent) {
        if (this.activeModifiers.has(e.keyCode)) {
            this.activeModifiers.delete(e.keyCode);
        } else if (this.activeKeys.has(e.keyCode)) {
            this.activeKeys.delete(e.keyCode);
        }
    }
}
const hotkeys = HotkeyManager.getInstance();
export { hotkeys }