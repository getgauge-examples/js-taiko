'use strict';
const {
    link, comboBox,inputField,text,$,contains
} = require('taiko');

function getElementWithSelector(element,selector){
    var selectedElement = null
    var selectedItem
    try{
        selectedItem =  JSON.parse(selector)
    }
    catch(err)
    {
        selectedItem = selector
    }
    switch(element){
        case "contains":
            selectedElement = contains(selectedItem)
            break;
        case "link":
            selectedElement = link(selectedItem)
            break;
        case "inputField":
            selectedElement = inputField(selectedItem)
            break;
        case "text":
            if(selectedItem.startsWith("contains"))
            {
                var result = selectedItem.substring(10,selectedItem.length-2)
                selectedElement = text(contains(result))
                break
            }
            selectedElement = text(selectedItem)
            break;
        case "$":
            selectedElement = $(selectedItem)
            break;
    }
    return selectedElement
}

function getElement(table){
    var referenceElement = null
    table.rows.forEach(function (row) {
        referenceElement = getElementWithSelector(row.cells[0],row.cells[1])
        if(row.cells[2])
        {
            return referenceElement[row.cells[2]]()
        }
    })
    return referenceElement
}

module.exports={
    getElement:getElement
}