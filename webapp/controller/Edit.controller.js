sap.ui.define([
	"opensap/manageproducts/controller/BaseController",
	"sap/ui/model/json/JSONModel",	
	"sap/ui/core/routing/History",
	"sap/m/MessageToast"
], function(BaseController,JSONModel, History, MessageToast) {
	"use strict";

	return BaseController.extend("opensap.manageproducts.controller.Edit", {

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the add controller is instantiated.
		 * @public
		 */
		onInit: function() {
				var oViewModel = new JSONModel({
					busy : false,
					delay : 0,
					lineItemListTitle : this.getResourceBundle().getText("detailLineItemTableHeading")
				});
				this.setModel(oViewModel, "detailView");				
			// Register to the add route matched
			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		_onObjectMatched : function (oEvent) {
			var sObjectId =  oEvent.getParameter("arguments").objectId;			
			// register for metadata loaded events
			var oModel = this.getModel();
			//oModel.metadataLoaded().then(this._onMetadataLoaded.bind(this));
			this.getModel().metadataLoaded().then( function() {
				//var sObjectId =  this.getView().getBindingContext().getProperty("ProductID");
				var sObjectPath = this.getModel().createKey("ProductSet", {
					ProductID		:sObjectId
				});
				this._bindView("/" + sObjectPath);
			}.bind(this));			
		},
		
		_onMetadataLoaded: function () {
			// create default properties
			// bind the view to the new entry
			//this.getView().setBindingContext(this._oContext);
			//this._bindView(sObjectPath);
		},
			/**
			 * Binds the view to the object path. Makes sure that detail view displays
			 * a busy indicator while data for the corresponding element binding is loaded.
			 * @function
			 * @param {string} sObjectPath path to the object to be bound to the view.
			 * @private
			 */
			_bindView : function (sObjectPath) {
				// Set busy indicator during view binding
				var oViewModel = this.getModel("detailView");

				// If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
				oViewModel.setProperty("/busy", false);

				this.getView().bindElement({
					path : sObjectPath,
					events: {
						change : this._onBindingChange.bind(this),
						dataRequested : function () {
							oViewModel.setProperty("/busy", true);
						},
						dataReceived: function () {
							oViewModel.setProperty("/busy", false);
						}
					}
				});
			},		
			_onBindingChange : function () {
				var oView = this.getView(),
					oElementBinding = oView.getElementBinding();

				// No data for the binding
				if (!oElementBinding.getBoundContext()) {
					this.getRouter().getTargets().display("objectNotFound");
					// if object could not be found, the selection in the master list
					// does not make sense anymore.
					this.getOwnerComponent().oListSelector.clearMasterListSelection();
					return;
				}

				// var sPath = oElementBinding.getPath(),
				// 	oResourceBundle = this.getResourceBundle(),
				// 	oObject = oView.getModel().getObject(sPath),
				// 	sObjectId = oObject.SoId,
				// 	sObjectName = oObject.BuyerName,
				// 	oViewModel = this.getModel("detailView");

				// this.getOwnerComponent().oListSelector.selectAListItem(sPath);

				// oViewModel.setProperty("/shareSendEmailSubject",
				// 	oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
				// oViewModel.setProperty("/shareSendEmailMessage",
				// 	oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
			},					
		_onCreateSuccess: function (oProduct) {
			// navigate to the new product's object view
			var sId = oProduct.ProductID;
			this.getRouter().navTo("object", {
				objectId : sId
			}, true);
	
			// unbind the view to not show this object again
			this.getView().unbindObject();
			
			// show success messge
			var sMessage = this.getResourceBundle().getText("newObjectCreated", [ oProduct.Name ]);
			MessageToast.show(sMessage, {
				closeOnBrowserNavigation : false
			});
		},

		/**
		 * Event handler for the cancel action
		 * @public
		 */
		onCancel: function() {
			this.onNavBack();
		},

		/**
		 * Event handler for the save action
		 * @public
		 */
		onSave: function() {
			this.getModel().submitChanges();
		},

		/**
		 * Event handler for navigating back.
		 * It checks if there is a history entry. If yes, history.go(-1) will happen.
		 * If not, it will replace the current entry of the browser history with the worklist route.
		 * @public
		 */
		onNavBack : function() {
			var oHistory = History.getInstance(),
				sPreviousHash = oHistory.getPreviousHash();

			// discard new product from model.
			this.getModel().deleteCreatedEntry(this._oContext);

			if (sPreviousHash !== undefined) {
				// The history contains a previous entry
				history.go(-1);
			} else {
				// Otherwise we go backwards with a forward history
				var bReplace = true;
				this.getRouter().navTo("worklist", {}, bReplace);
			}
		}

	});
});