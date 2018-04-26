'use strict'

var yo = require('yo-yo')
var css = require('./universal-dapp-styles')

class MultiParamManager {

  /**
    *
    * @param {bool} lookupOnly
    * @param {Object} funABI
    * @param {Function} clickMultiCallBack
    * @param {string} inputs
    * @param {string} title
    *
    */
  constructor (lookupOnly, funABI, clickCallBack, inputs, title) {
    this.lookupOnly = lookupOnly
    this.funABI = funABI
    this.clickCallBack = clickCallBack
    this.inputs = inputs
    this.title = title
    this.basicInputField
    this.multiFields
  }

  switchMethodViewOn () {
    this.contractActionsContainerSingle.style.display = 'none'
    this.contractActionsContainerMulti.style.display = 'flex'
    // fill in the inputs
    this.makeMultiVal()
  }

  switchMethodViewOff () {
    this.contractActionsContainerSingle.style.display = 'flex'
    this.contractActionsContainerMulti.style.display = 'none'
    this.basicInputField.value = this.getMultiValsString()
  }
  getMultiValsString () {
    var valArray = this.multiFields.querySelectorAll('input')
    var ret = ''
    for (var k = 0; k < valArray.length; k++) {
      var el = valArray[k]
      if (ret !== '') ret += ','
      ret += el.value
    }
    return ret
  }

  emptyInputs () {
    var valArray = this.multiFields.querySelectorAll('input')
    for (var k = 0; k < valArray.length; k++) {
      valArray[k].value = ''
    }
    this.basicInputField.value = ''
  }

  makeMultiVal () {
    var inputString = this.basicInputField.value
    console.log(inputString)
    var inputStringArray = inputString.split(',')
    // !! the split here will mess up a value with a comma in it !!
    // do we not make a split if its a , inside a []?
    var multiInputs = this.multiFields.querySelectorAll('input')
    for (var k = 0; k < multiInputs.length; k++) {
      multiInputs[k].value = inputStringArray[k]
    }
  }

  createMultiFields () {
    if (this.funABI.inputs) {
      return yo`<div>
        ${this.funABI.inputs.map(function (inp) {
          return yo`<div class="${css.multiArg}"><label for="${inp.name}"> ${inp.name}: </label><input placeholder="${inp.type}" id="${inp.name}" title="${inp.name}"></div>`
        })}
      </div>`
    }
  }

  render () {
    var title
    if (this.title) {
      title = this.title
    } else if (this.funABI.name) {
      title = this.funABI.name
    } else {
      title = '(fallback)'
    }

    this.basicInputField = yo`<input></input>`
    this.basicInputField.setAttribute('placeholder', this.inputs)
    this.basicInputField.setAttribute('title', this.inputs)

    var onClick = (domEl) => {
      this.clickCallBack(this.funABI.inputs, this.basicInputField.value)
      this.emptyInputs()
    }

    this.contractActionsContainerSingle = yo`<div class="${css.contractActionsContainerSingle}" >
      <button onclick=${() => { onClick() }} class="${css.instanceButton}">${title}</button>${this.basicInputField}<i class="fa fa-angle-down ${css.methCaret}" onclick=${() => { this.switchMethodViewOn() }} title=${title} ></i>
      </div>`

    this.multiFields = this.createMultiFields()
    var multiOnClick = () => {
      var valArray = this.multiFields.querySelectorAll('input')
      var ret = ''
      for (var k = 0; k < valArray.length; k++) {
        var el = valArray[k]
        if (ret !== '') ret += ','
        el.value = el.value.replace(/(^|,\s+|,)([a-zA-Z]+)(\s+,|,|$)/g, '$1"$2"$3') // replace non quoted string - that starts with a letter
        ret += el.value
      }
      this.clickCallBack(this.funABI.inputs, ret)
      this.emptyInputs()
    }

    var button = yo`<button onclick=${() => { multiOnClick() }} class="${css.instanceButton}"></button>`

    this.contractActionsContainerMulti = yo`<div class="${css.contractActionsContainerMulti}" >
      <div class="${css.contractActionsContainerMultiInner}" >
        <div onclick=${() => { this.switchMethodViewOff() }} class="${css.multiHeader}">
          <div class="${css.multiTitle}">${title}</div>
          <i class='fa fa-angle-up ${css.methCaret}'></i>
        </div>
        ${this.multiFields}
        <div class="${css.group} ${css.multiArg}" >
          ${button}
        </div>
      </div>
    </div>`

    var contractProperty = yo`<div class="${css.contractProperty}">${this.contractActionsContainerSingle} ${this.contractActionsContainerMulti}</div>`

    if (this.lookupOnly) {
      contractProperty.classList.add(css.constant)
      button.setAttribute('title', (title + ' - call'))
      button.innerHTML = 'call'
      this.contractActionsContainerSingle.querySelector(`.${css.instanceButton}`).setAttribute('title', (title + ' - call'))
    }

    if (this.funABI.inputs && this.funABI.inputs.length > 0) {
      contractProperty.classList.add(css.hasArgs)
    } else {
      this.contractActionsContainerSingle.querySelector('i').style.visibility = 'hidden'
      this.basicInputField.style.display = 'none'
    }

    if (this.funABI.payable === true) {
      contractProperty.classList.add(css.payable)
      button.setAttribute('title', (title + ' - transact (payable)'))
      button.innerHTML = 'transact'
      this.contractActionsContainerSingle.querySelector('button').setAttribute('title', (title + ' - transact (payable)'))
    }

    if (!this.lookupOnly && this.funABI.payable === false) {
      button.setAttribute('title', (title + ' - transact (not payable)'))
      button.innerHTML = 'transact'
      this.contractActionsContainerSingle.querySelector('button').setAttribute('title', (title + ' - transact (not payable)'))
    }

    return contractProperty
  }
}

module.exports = MultiParamManager
