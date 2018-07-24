'use strict';
const {
    link, comboBox,inputField
} = require('taiko');

function getElementWithSelector(element,selector){
    console.log(element)
    console.log(selector)
    var selectedItem =  JSON.parse(selector)
    switch(element){
        case "link":
            return link(selectedItem)
        case "inputField":
            return inputField(selectedItem)
    }
    return null
}

function getElement(table){
    var referenceElement = null
    table.rows.forEach(function (row) {
        referenceElement = getElementWithSelector(row.cells[0],row.cells[1])
    })
    return referenceElement
}

module.exports={
    getElement:getElement
}