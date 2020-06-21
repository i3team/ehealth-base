import React, { Fragment } from 'react';
import PropTypes from "prop-types";
import BaseButton from './BaseButton';

class BaseTableButton extends BaseButton {
    constructor(props) {
        super(props);
    }
    static propTypes = {
        selectedItems: PropTypes.array.isRequired,
        callback: PropTypes.func,
    }
    isApplicable() {
        return this.props.selectedItems.some(item => this.isItemApplicable(item));
    }
    actionName() {
        throw 'Not implemented actionName';
    }
    rowUnitName(){
        return 'hàng';
    }
    text() {
        const { selectedItems } = this.props;
        let count = selectedItems.filter(item => this.isItemApplicable(item)).length
        return this.actionName() + ` ${count} ${this.rowUnitName()}`;
    }
    isItemApplicable(item) {
        throw 'Not implemented `isItemApplicable`';
    }
}

export default BaseTableButton;
