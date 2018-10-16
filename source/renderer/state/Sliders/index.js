import { Container } from 'unstated';
import { LABELS } from 'constants';

const initSlider = (name, value) => ({ name, value });

class SlidersState extends Container {
    constructor() { 
        super();
        Object.defineProperty(this, '_state', {
            enumerable: false, /* hide */
            writable: false,
            value: {
                sliders: [
                    initSlider(LABELS.SLIDERS.ALL, false),
                    initSlider(LABELS.SLIDERS.TEXT, false),
                    initSlider(LABELS.SLIDERS.PHOTO, false),
                    initSlider(LABELS.SLIDERS.ASK, false),
                    initSlider(LABELS.SLIDERS.VIDEO, false),
                    initSlider(LABELS.SLIDERS.CHAT, false)
                ]
            }
        });

        this.state = this._state;
    }

    toggleSlider = async (index) => {
        if (this.state.sliders.length > index || index < 0) {
            return false;
        }

        const slider = this.state.sliders[index];

        if (slider.name === LABELS.SLIDERS.ALL) {
            await this.setState(this._state);
        }
        else {
            slider.value = !slider.value;
            const sliders = [ 
                ...this.state.sliders.slice(0, index), 
                slider, 
                ...this.state.sliders.slice(index + 1)
            ];

            await this.setState({ sliders });
        }
    };
}

export default SlidersState;