(function() {
    window.globVar_UI5_Table = "test";
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
                		showHeader="true"
                		enableScrolling="false"
                		class="sapUiContentPadding">
		                  <m:content>
                  			<Table id="ins"
                  				rows="{/Products}"
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

// ------------------------------------------------------------------
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

        addRow(NewRow){
          let arrayMembers = str.split('|');


          let NewRow = {
	           "name"         : "Ab die Post",
	           "ProductId"    : "344254565X",
	           "Quantity"     : "Pratchet",
	           "DeliveryDate" : "15.8.2005"
              }
          let  table = window.globVar_UI5_Table;
          table.getModel().getData().Products.push(arrayMembers);
          model.refresh();
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
			//test comment
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

    // ----------------END class Ui5CustTable extends HTMLElement----------------

    customElements.define("tp-sac-selectiontable-ui5", Ui5CustTable);

    // ---------------- UTILS -------------------------------------------------
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
                                   onInit: function() {

                                     if (that._firstConnection === 0) {
                                         that._firstConnection = 1;
                                     } else {

                                           this._data = {
                                            Products : [
                                              { Name: 'Standard CAN'  ,  ProductId : 'RB1234 ', Quantity: 1000, DeliveryDate: 20210101 },
                                              { Name: 'Hero CAN'      ,  ProductId : 'RB1235 ', Quantity: 2000, DeliveryDate: 20210301 },
                                              { Name: 'Summer Edition',  ProductId : 'RB1236 ', Quantity: 2000, DeliveryDate: 20211215 }
                                            ]

                                           };

                                           this.jModel = new sap.ui.model.json.JSONModel();
                                           this.jModel.setData(this._data);
                                      }

                                   },

                                   onBeforeRendering: function() {
                                     this.byId('ins').setModel(this.jModel);
                                     window.globVar_UI5_Table = this.byId('ins');
                                   },
                                   onButtonPress: function(oEvent) {
                                       // _password = oView.byId("passwordInput").getValue();
                                       that._firePropertiesChanged();

                                       this.settings = {};
                                       this.settings.password = "";

                                       that.dispatchEvent(new CustomEvent("onStart", {
                                           detail: {
                                               settings: this.settings
                                           }
                                       }));
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

    // ---------------- UTILS END -----------------------------------------------

    function createGuid() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
            let r = Math.random() * 16 | 0,
                v = c === "x" ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
})();
