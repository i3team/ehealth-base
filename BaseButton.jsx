import React, { Fragment } from 'react';
import PropTypes from "prop-types";
import EHealthButton from '../ui-kit/button/EHealthButton';
import EHealthBaseConsumer from './EHealthBaseConsumer';

class BaseButton extends EHealthBaseConsumer {
    constructor(props) {
        super(props);
    }
    variant() {
        return "solid";
    }
    text() {
        throw 'Not implemented `text`';
    }
    iconClassName() {
        return null;
    }
    onClick(ev) {
        throw 'Not implemented `onClick`';
    }
    isApplicable() {
        throw 'Not implemented `isApplicable`';
    }
    consumerContent() {
        const { margin } = this.props;
        let canDisplay = this.isApplicable();
        if (canDisplay == false) {
            return null;
        }
        return (
            <Fragment>
                <EHealthButton
                    margin={margin}
                    iconClassName={this.iconClassName()}
                    variant={this.variant()}
                    onClick={this.onClick}
                >
                    {this.text()}
                </EHealthButton>
            </Fragment>
        )
    }
}

export default BaseButton;