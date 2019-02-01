import * as React from "react";
import { AudioInterface } from "lib/AudioInterface";

export interface AudioViewProps {
    buffer: AudioBuffer;
    numbins: number;
    audioctx: AudioContext;
}
interface AudioViewState {
    ctx: CanvasRenderingContext2D,
    chartImage: ImageData,
    mouseX: number,
    isSelecting: boolean,
    selectionStart: number,
    selectionEnd: number,
    didDrag: boolean
}

export class AudioView extends React.Component<AudioViewProps, AudioViewState> {
    readonly state: AudioViewState = {
        ctx: null,
        chartImage: null,
        mouseX: null,
        isSelecting: false,
        selectionStart: null,
        selectionEnd: null,
        didDrag: false
    }

    componentDidMount() {
        var el = this.refs.canvas as HTMLCanvasElement,
            ctx = el.getContext('2d');
        el.width = 500;
        el.height = 200;
        this.setState({ ctx });
    }

    get hoveredTimestamp() {
        var percent = this.state.mouseX / (this.refs.canvas as HTMLCanvasElement).width;
        var index = Math.round(this.props.buffer.length * percent);
        var sample_rate = 44100;
        var seconds = index / sample_rate;
        var val = seconds * 1000;


        var ms = 0,
            sec = 0,
            min = 0,
            hour = 0;

        if (val > 999) {
            ms = val % 1000;
            val = val / 1000;
            if (val > 59) {
                sec = val % 60;
                val = val / 60;
                if (val > 59) {
                    min = val % 60;
                    val = val / 60;
                    hour = val;
                } else {
                    min = val;
                }
            } else {
                sec = val;
            }
        } else {
            ms = val;
        }

        var ret = `${Math.floor(ms).toString()}`;
        if (sec) {
            ret = `${Math.floor(sec).toString()}:` + ret;
        } else {
            ret = "00:" + ret;
        }
        if (min) {
            ret = `${Math.floor(min).toString()}:` + ret;
        } else {
            ret = "00:" + ret;
        }
        if (hour) {
            ret = `${Math.floor(hour).toString()}:` + ret;
        } else {
            ret = "00:" + ret;
        }
        return {
            str: ret,
            seconds
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        if ((nextProps.buffer && !this.props.buffer) || (nextProps.numbins !== this.props.numbins)) {
            return true;
        }
        return false;
    }

    componentDidUpdate() {
        if (this.props.buffer) {
            this.drawMusic();
        }
    }

    doMouseMove(evt) {
        const newState: any = {};
        if (!evt) {
            // Mouse has left the canvas
            newState.mouseX = null;
            if (this.state.isSelecting) {
                newState.selectionStart = null;
                newState.selectionEnd = null;
            }
            newState.isSelecting = false;
        } else {
            var bounds = evt.target.getBoundingClientRect();
            newState.mouseX = evt.clientX - bounds.left;
            newState.didDrag = true;
            if (this.state.isSelecting) {
                newState.selectionEnd = newState.mouseX;
            }
        }

        this.setState(newState);
        this.drawChart();
    }

    doMouseCapture(evt) {
        var newState: any = {
            isSelecting: !!evt,
        };
        if (evt) {
            var bounds = evt.target.getBoundingClientRect();
            newState.selectionStart = evt.clientX - bounds.left;
            newState.selectionEnd = null;

            var source = this.props.audioctx.createBufferSource();
            source.buffer = this.props.buffer;
            source.connect(this.props.audioctx.destination);
            source.start(0, this.hoveredTimestamp.seconds);

        } else {
            if (!this.state.didDrag) {
                newState.selectionEnd = null;
            }
            newState.didDrag = false;
        }
        this.setState(newState);
        this.drawChart();
    }

    drawChart() {
        requestAnimationFrame(() => {
            var ctx = this.state.ctx;
            var canvas = this.refs.canvas as HTMLCanvasElement;
            ctx.save();
            ctx.fillStyle = "#FFF";
            //ctx.fillRect(0,0,canvas.width,canvas.height);
            if (this.state.chartImage) {
                ctx.putImageData(this.state.chartImage, 0, 0);
            }

            // Selection Fill
            if (this.state.selectionEnd) {
                let width = this.state.selectionEnd - this.state.selectionStart;
                ctx.globalAlpha = 0.3;
                ctx.fillStyle = "#000";
                ctx.fillRect(this.state.selectionStart, 0, width, canvas.height);
                ctx.globalAlpha = 1;
            }

            // Hover Stroke
            if (!!this.state.mouseX && !this.state.isSelecting) {
                ctx.strokeStyle = "#FF0000";
                ctx.beginPath()
                ctx.moveTo(this.state.mouseX, 0);
                ctx.lineTo(this.state.mouseX, canvas.height);
                ctx.stroke();
            }

            // Selection Stroke
            if (!this.state.selectionEnd && this.state.selectionStart) {
                ctx.strokeStyle = "#0000FF";
                ctx.beginPath()
                ctx.moveTo(this.state.selectionStart, 0);
                ctx.lineTo(this.state.selectionStart, canvas.height);
                ctx.stroke();
            }
            ctx.fillStyle = "#000";
            ctx.fillText(this.hoveredTimestamp.str, 50, 10)
            ctx.restore();
        });
    }

    drawMusic() {
        var ctx = this.state.ctx;
        var buff = this.props.buffer;
        var el = this.refs.canvas as HTMLCanvasElement;
        const channel = buff.getChannelData(0);
        const rchannel = buff.getChannelData(1);
        ctx.save();
        ctx.fillStyle = "#FFF";
        ctx.fillRect(0, 0, el.width, el.height);
        ctx.translate(0, el.height / 2);
        ctx.fillStyle = "#000";
        const div = Math.round(channel.length / this.props.numbins);
        const iwidth = Math.max(el.width / this.props.numbins, 1);
        const margin = iwidth * 0.15;
        for (var i = 0; i < channel.length; i += div) {
            var x = Math.round(i / div) * iwidth;
            var miny = 0, maxy = 0;
            for (var j = 0; j < div && (i + j) < channel.length; j++) {
                miny += Math.abs(channel[i + j]);
                maxy += Math.abs(rchannel[i + j]);
            }
            miny = (miny / div) * (el.height / 2);
            maxy = (maxy / div) * (el.height / 2);
            ctx.fillRect(Math.floor(x + margin),
                Math.round(0 - miny),
                Math.round(iwidth - (margin * 2)),
                Math.round(miny + maxy));
        }
        var img = ctx.getImageData(0, 0, el.width, el.height);
        ctx.restore();
        this.setState({
            chartImage: img
        });
        this.drawChart();
    }

    render() {
        return (<canvas ref="canvas"
            onMouseMoveCapture={evt => this.doMouseMove.bind(this)(evt)}
            onMouseLeave={evt => this.doMouseMove.bind(this)(null)}
            onMouseDownCapture={evt => this.doMouseCapture.bind(this)(evt)}
            onMouseUpCapture={evt => this.doMouseCapture.bind(this)(null)}>
        </canvas>);
    }
}