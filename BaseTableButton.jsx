import React, { Fragment } from 'react';
import PropTypes from "prop-types";
import BaseButton from './BaseButton';
import { readKey } from '../../general/helper';


class BaseTableButton extends BaseButton {
    constructor(props) {
        super(props);
    }
    static propTypes = {
        selectedItems: PropTypes.array,
        callback: PropTypes.func,
        closeDrawer: PropTypes.func,
    }
    getSelectedItems(){
        return this.props.selectedItems.map(i => ({
            key: readKey(i.key, i.headerLevel, i.footerLevel),
            dataType: i.dataType
        }));
    }
    isApplicable() {
        return this.props.selectedItems.some(item => this.isItemApplicable(item));
    }
    isItemApplicable(item) {
        throw 'Not implemented `isItemApplicable`';
    }
    actionName() {
        throw 'Not implemented actionName';
    }
    rowUnitName() {
        return 'hàng';
    }
    text() {
        const { selectedItems } = this.props;
        let count = selectedItems.filter(item => this.isItemApplicable(item)).length
        return this.actionName() + ` ${count} ${this.rowUnitName()}`;
    }
}

export default BaseTableButton;
