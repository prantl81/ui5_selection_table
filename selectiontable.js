(function() {
    let _shadowRoot;
    let _id;
    let _password;

    let tmpl = document.createElement("template");
    tmpl.innerHTML = `
        <style>
        </style>
        <div id="ui5_content" name="ui5_content">
         <slot name="content"></slot>
        </div>
        <script id="oView" name="oView" type="sapui5/xmlview">
            <mvc:View
			    controllerName="myView.Template"
					xmlns="sap.ui.table"
	xmlns:mvc="sap.ui.core.mvc"
	xmlns:u="sap.ui.unified"
	xmlns:c="sap.ui.core"
	xmlns:m="sap.m"
    height="100%">
	<m:Page
		showHeader="false"
		enableScrolling="false"
		class="sapUiContentPadding">
		<m:content>
			<Table
				rows="{/ProductCollection}"
				selectionMode="MultiToggle"
				visibleRowCount="7"
				paste="onPaste"
				ariaLabelledBy="title">
				<extension>
					<m:OverflowToolbar style="Clear">
						<m:Title id="title" text="Products"/>
					</m:OverflowToolbar>
				</extension>
				<columns>
					<Column width="11rem">
						<m:Label text="Product Name" />
						<template>
							<m:Text text="{Name}" wrapping="false" />
						</template>
					</Column>
					<Column width="11rem">
						<m:Label text="Product Id" />
						<template>
							<m:Input value="{ProductId}"/>
						</template>
					</Column>
					<Column width="6rem" hAlign="End">
						<m:Label text="Quantity" />
						<template>
							<m:Label text="{Quantity}" />
						</template>
					</Column>
					<Column width="9rem">
						<m:Label text="Status" />
						<template>
							<m:ObjectStatus text="{Status}" state="{
								path: 'Available',
								formatter: '.formatAvailableToObjectState'
							}"/>
						</template>
					</Column>
					<Column width="9rem">
						<m:Label text="Price" />
						<template>
							<u:Currency value="{Price}" currency="{CurrencyCode}"/>
						</template>
					</Column>
					<Column width="12rem">
						<m:Label text="Supplier" />
						<template>
							<m:ComboBox value="{SupplierName}" items="{/Suppliers}">
								<c:Item text="{Name}"/>
							</m:ComboBox>
						</template>
					</Column>
					<Column width="9rem">
						<m:Label text="Image" />
						<template>
							<m:Link text="Show Image" href="{ProductPicUrl}" target="_blank"/>
						</template>
					</Column>
					<Column width="9rem">
						<m:Label text="Details" />
						<template>
							<m:Button text="Show Details" press="handleDetailsPress"/>
						</template>
					</Column>
					<Column width="7rem">
						<m:Label text="Heavy Weight" />
						<template>
							<m:CheckBox selected="{
								path: 'Heavy',
								type: 'sap.ui.model.type.String'
							}"/>
						</template>
					</Column>
					<Column width="12rem">
						<m:Label text="Main Category" />
						<template>
							<m:Select selectedKey="{Category}" items="{/Categories}">
								<c:Item text="{Name}" key="{Name}"/>
							</m:Select>
						</template>
					</Column>
					<Column width="12rem">
						<m:Label text="Additional Categories" />
						<template>
							<m:MultiInput
								tokenUpdate="updateMultipleSelection"
								value="{AdditionalCategory}"
								tokens="{AdditionalCategoriesSelection}"
								suggestionItems="{
									path: '/Categories',
									sorter: { path: 'Name' }
								}"
								showValueHelp="false"
								>
								<m:tokens>
									<m:Token key="{Key}" text="{Name}"/>
								</m:tokens>
								<m:suggestionItems>
									<c:Item key="{ProductId}" text="{Name}" />
								</m:suggestionItems>
							</m:MultiInput>
						</template>
					</Column>
					<Column width="6rem" hAlign="Center">
						<m:Label text="Status" />
						<template>
							<c:Icon src="{
								path: 'Available',
								formatter: '.formatAvailableToIcon'
							}"/>
						</template>
					</Column>
					<Column width="11rem" hAlign="Center">
						<m:Label text="Delivery Date" />
						<template>
							<m:DatePicker value="{
								path: 'DeliveryDate',
								type: 'sap.ui.model.type.Date',
								formatOptions: {source: {pattern: 'timestamp'}}
							}"/>
						</template>
					</Column>
				</columns>
			</Table>
		</m:content>
	</m:Page>
</mvc:View>
        </script>        
    `;

    class Ui5CustTable extends HTMLElement {

        constructor() {
            super();

            _shadowRoot = this.attachShadow({
                mode: "open"
            });
            _shadowRoot.appendChild(tmpl.content.cloneNode(true));

            _id = createGuid();

            _shadowRoot.querySelector("#oView").id = _id + "_oView";

            this._export_settings = {};
            this._export_settings.password = "";

            this.addEventListener("click", event => {
                console.log('click');
            });
        }

        connectedCallback() {
            try {
                if (window.commonApp) {
                    let outlineContainer = commonApp.getShell().findElements(true, ele => ele.hasStyleClass && ele.hasStyleClass("sapAppBuildingOutline"))[0]; // sId: "__container0"

                    if (outlineContainer && outlineContainer.getReactProps) {
                        let parseReactState = state => {
                            let components = {};

                            let globalState = state.globalState;
                            let instances = globalState.instances;
                            let app = instances.app["[{\"app\":\"MAIN_APPLICATION\"}]"];
                            let names = app.names;

                            for (let key in names) {
                                let name = names[key];

                                let obj = JSON.parse(key).pop();
                                let type = Object.keys(obj)[0];
                                let id = obj[type];

                                components[id] = {
                                    type: type,
                                    name: name
                                };
                            }

                            for (let componentId in components) {
                                let component = components[componentId];
                            }

                            let metadata = JSON.stringify({
                                components: components,
                                vars: app.globalVars
                            });

                            if (metadata != this.metadata) {
                                this.metadata = metadata;

                                this.dispatchEvent(new CustomEvent("propertiesChanged", {
                                    detail: {
                                        properties: {
                                            metadata: metadata
                                        }
                                    }
                                }));
                            }
                        };

                        let subscribeReactStore = store => {
                            this._subscription = store.subscribe({
                                effect: state => {
                                    parseReactState(state);
                                    return {
                                        result: 1
                                    };
                                }
                            });
                        };

                        let props = outlineContainer.getReactProps();
                        if (props) {
                            subscribeReactStore(props.store);
                        } else {
                            let oldRenderReactComponent = outlineContainer.renderReactComponent;
                            outlineContainer.renderReactComponent = e => {
                                let props = outlineContainer.getReactProps();
                                subscribeReactStore(props.store);

                                oldRenderReactComponent.call(outlineContainer, e);
                            }
                        }
                    }
                }
            } catch (e) {}
        }

        disconnectedCallback() {
            if (this._subscription) { 
                this._subscription();
                this._subscription = null;
            }
        }

        onCustomWidgetBeforeUpdate(changedProperties) {
            if ("designMode" in changedProperties) {
                this._designMode = changedProperties["designMode"];
            }
        }

        onCustomWidgetAfterUpdate(changedProperties) {
            loadthis(this);
        }

        _firePropertiesChanged() {
            this.password = "";
            this.dispatchEvent(new CustomEvent("propertiesChanged", {
                detail: {
                    properties: {
                        password: this.password
                    }
                }
            }));
        }

        // SETTINGS
        get password() {
            return this._export_settings.password;
        }
        set password(value) {
            value = _password;
            this._export_settings.password = value;
        }

        static get observedAttributes() {
            return [
                "password"
            ];
        }

        attributeChangedCallback(name, oldValue, newValue) {
            if (oldValue != newValue) {
                this[name] = newValue;
            }
        }

    }
    customElements.define("tp-sac-selectiontable-ui5", Ui5CustTable);

    // UTILS
    function loadthis(that) {
        var that_ = that;
      
        let content = document.createElement('div');
        content.slot = "content";
        that_.appendChild(content);

        sap.ui.getCore().attachInit(function() {
            "use strict";

            //### Controller ###
            sap.ui.define([
               "sap/base/Log",
		"sap/ui/core/mvc/Controller",
		"sap/ui/model/json/JSONModel",
		"sap/m/MessageToast",
		"sap/ui/core/format/DateFormat",
		"sap/ui/thirdparty/jquery"
            ], function(Log, Controller, JSONModel, MessageToast, DateFormat, jQuery) {
                "use strict";

                return Controller.extend("myView.Template", {
                    onButtonPress: function(oEvent) {
                        _password = oView.byId("passwordInput").getValue();
                        that._firePropertiesChanged();
                        console.log(_password);

                        this.settings = {};
                        this.settings.password = "";

                        that.dispatchEvent(new CustomEvent("onStart", {
                            detail: {
                                settings: this.settings
                            }
                        }));
                    } 
			
		    onInit : function() {
			// set explored app's demo model on this sample
			var oJSONModel = this.initSampleDataModel();
			this.getView().setModel(oJSONModel);
		},

		initSampleDataModel : function() {
			var oModel = new JSONModel();

			var oDateFormat = DateFormat.getDateInstance({source: {pattern: "timestamp"}, pattern: "dd/MM/yyyy"});

			jQuery.ajax(sap.ui.require.toUrl("https://prantl81.github.io/ui5_selection_table/products.json"), {
				dataType: "json",
				success: function(oData) {
					var aTemp1 = [];
					var aTemp2 = [];
					var aSuppliersData = [];
					var aCategoryData = [];
					for (var i = 0; i < oData.ProductCollection.length; i++) {
						var oProduct = oData.ProductCollection[i];
						if (oProduct.SupplierName && aTemp1.indexOf(oProduct.SupplierName) < 0) {
							aTemp1.push(oProduct.SupplierName);
							aSuppliersData.push({Name: oProduct.SupplierName});
						}
						if (oProduct.Category && aTemp2.indexOf(oProduct.Category) < 0) {
							aTemp2.push(oProduct.Category);
							aCategoryData.push({Name: oProduct.Category});
						}
						oProduct.DeliveryDate = (new Date()).getTime() - (i % 10 * 4 * 24 * 60 * 60 * 1000);
						oProduct.DeliveryDateStr = oDateFormat.format(new Date(oProduct.DeliveryDate));
						oProduct.Heavy = oProduct.WeightMeasure > 1000 ? "true" : "false";
						oProduct.Available = oProduct.Status == "Available" ? true : false;
					}

					oData.Suppliers = aSuppliersData;
					oData.Categories = aCategoryData;

					oModel.setData(oData);
				},
				error: function() {
					Log.error("failed to load json");
				}
			});

			return oModel;
		},
		updateMultipleSelection: function(oEvent) {
			var oMultiInput = oEvent.getSource(),
				sTokensPath = oMultiInput.getBinding("tokens").getContext().getPath() + "/" + oMultiInput.getBindingPath("tokens"),
				aRemovedTokensKeys = oEvent.getParameter("removedTokens").map(function(oToken) {
					return oToken.getKey();
				}),
				aCurrentTokensData = oMultiInput.getTokens().map(function(oToken) {
					return {"Key" : oToken.getKey(), "Name" : oToken.getText()};
				});

			aCurrentTokensData = aCurrentTokensData.filter(function(oToken){
				return aRemovedTokensKeys.indexOf(oToken.Key) === -1;
			});

			oMultiInput.getModel().setProperty(sTokensPath, aCurrentTokensData);
		},

		formatAvailableToObjectState : function(bAvailable) {
			return bAvailable ? "Success" : "Error";
		},

		formatAvailableToIcon : function(bAvailable) {
			return bAvailable ? "sap-icon://accept" : "sap-icon://decline";
		},

		handleDetailsPress : function(oEvent) {
			MessageToast.show("Details for product with id " + this.getView().getModel().getProperty("ProductId", oEvent.getSource().getBindingContext()));
		},

		onPaste: function(oEvent) {
			var aData = oEvent.getParameter("data");
			MessageToast.show("Pasted Data: " + aData);
		}	
			
			
                });
            });

            //### THE APP: place the XMLView somewhere into DOM ###
            var oView  = sap.ui.xmlview({
                viewContent: jQuery(_shadowRoot.getElementById(_id + "_oView")).html(),
            });
            oView.placeAt(content);


            if (that_._designMode) {
                oView.byId("passwordInput").setEnabled(false);
            }
        });
    }

    function createGuid() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
            let r = Math.random() * 16 | 0,
                v = c === "x" ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }  
})();
