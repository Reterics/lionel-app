/**
 * @typedef LionelRouter
 * @property {Object} routes
 * @property {string} resFolder
 * @property {string} currentTemplate
 * @property {function} route
 * @property {function} checkRoute
 * @property {function} templateExists
 * @property {function} render
 * @property {function} isSecureConsole
 * @property {function} handleRequest
 */
/**
 * @typedef Template
 * @property {string} html
 * @property {string} onRendered
 */
/**
 * @typedef renderTemplate
 * @type {function}
 * @param {string} name
 * @param {Object} parameters: usually {}
 * @param {object|undefined} res
 * @return {string|Template}
 */
/**
 * @typedef TemplateManager
 * @property {function} addTemplate
 * @property {function} sendRenderData
 * @property {renderTemplate} renderTemplate
 * @property {function} loadTemplates
 * @property {function} setGlobalJS
 * @property {function} loadGlobalJS
 * @property {function} addLibFolder
 * @property {function} loadControllers
 * @property {function} loadOneClientFile
 * @property {function} _replace
 * @property {function} _addJSToRenderList
 * @property {function} _getTemplateCode
 * @property {function} _checkForTemplates
 */

/**
 * @typedef LionelObject
 * @property {null|TemplateManager} templateManager
 * @property {Object} _methods
 * @property {Object} _innerMethods
 * @property {function} methods
 * @property {function} startup
 * @property {LionelRouter} Router
 * @property {boolean} debug
 * @property {null|Object} DB
 */
