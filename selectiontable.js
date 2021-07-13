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
                		showHeader="false"
                		enableScrolling="false"
                		class="sapUiContentPadding">
		                  <m:content>
                  			<Table
                          id="oTable"
                  				rows="{/TableData}"
                  				selectionMode="Single"
                          selectionBehavior="RowOnly"
                        	visibleRowCount="15"
                          sort="sortProductId"
                  				ariaLabelledBy="title">
                  				<extension>
                  					<m:OverflowToolbar style="Clear">
                  						<m:Title id="title" text="Table Data"/>
                  					</m:OverflowToolbar>
                  				</extension>
                  				<columns>
                  					<Column width="11rem" sortProperty="Name" filterProperty="Name">
                  						<m:Label text="Product Name" />
                  						<template>
                  							<m:Text text="{Name}" wrapping="false" />
                  						</template>
                  					</Column>
                  					<Column width="11rem" sortProperty="ProductId">
                  						<m:Label text="Product Id" />
                  						<template>
                  							<m:Label text="{ProductId}"/>
                  						</template>
                  					</Column>
                  					<Column width="6rem" sortProperty="Quantity" hAlign="End">
                  						<m:Label text="Quantity" />
                  						<template>
                  							<m:Label text="{Quantity}" />
                  						</template>
                  					</Column>
                  					<Column width="11rem" hAlign="Center">
                  						<m:Label text="Delivery Date" />
                  						<template>
                  						 	<m:Label text="{DeliveryDate}" />
                  						</template>
                  					</Column>
                            <Column width="7rem">
						                 <m:Label text="SPL" />
						                   <template>
							                    <m:CheckBox selected="{
								                               path: 'Heavy',
								                               type: 'sap.ui.model.type.String'
                  							  }"/>
                  						</template>
                  				 </Column>
                           <Column width="9rem">
						                     <m:Label text="Open" />
						                           <template>
							                                <m:Button text="Open Version" press="handleOpenVersionPress"/>
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
                let  oTable = window.globVar_UI5_Table
                var context = oTable.getContextByIndex(oTable.getSelectedIndex());
                var value = context.getProperty("ProductId");

                this.dispatchEvent(new Event("onSelectionChange", {
                      detail: {
                            properties: {
                              password: value
                            }
                      }
                }));
            });



            /*
            this.addEventListener("VersionOpenPressed", event => {
                console.log('VersionOpenPressed');
                let  oTable = window.globVar_UI5_Table
                var context = oTable.getContextByIndex(oTable.getSelectedIndex());
                var value = context.getProperty("ProductId");
            });
            */

            this.addEventListener("VersionOpenPressed",
              function() { // anonymus function
                pressButtonVersion(object_button);
              },
              false
            );

            pressButtonVersion(object_button){
                for (const [key, value] of Object.entries(oSelRow)) {
                //we start not with a | , format: <field1>|<field2>|<field3>
                  if ( index === 0 ){
                    returnValue = value;
                  } else {
                    returnValue = returnValue + "|" + value;
                  }
                  index = index + 1;
                }
            };

          }








        addRow(NewRow){
          let arrayMembers = NewRow.split('|');

          let assosciated_array = {
            Name : arrayMembers[0],
            ProductId : arrayMembers[1],
            Quantity  : arrayMembers[2],
            DeliveryDate : arrayMembers[3]
          }

          let  oTable = window.globVar_UI5_Table;
          let oModel = oTable.getModel();
          let oData = oModel.getData();
          oData.TableData.push(assosciated_array);
          oModel.refresh();
        }


        deleteRow(RowToDelete){
          //delete via string coming from outside
          /*
          let arrayMembers = RowToDelete.split('|');

          let assosciated_array = {
            Name : arrayMembers[0],
            ProductId : arrayMembers[1],
            Quantity  : arrayMembers[2],
            DeliveryDate : arrayMembers[3]
          }
          */

          //alternativly -> get selected row
          let  oTable = window.globVar_UI5_Table
          var oContext = oTable.getContextByIndex(oTable.getSelectedIndex());
          var sPath = oContext.getPath();
          var oSelRow = oContext.getProperty(sPath);


          let oModel = oTable.getModel();
          let oData = oModel.getData();

          //Delete record from table
        	for(var i=0; i<oData.TableData.length; i++){
        			if(oData.TableData[i] == oSelRow ){
        						oData.TableData.splice(i,1); //removing 1 record from i th index.
        						oModel.refresh();
        						break;//quit the loop
        			}
        	}
	      }


        getSelectedRow(){
          let  oTable = window.globVar_UI5_Table
          var oContext = oTable.getContextByIndex(oTable.getSelectedIndex());

          var sPath = oContext.getPath();
          var oSelRow = oContext.getProperty(sPath);

          let returnValue = "";
          //Loop Over Object to get only values into
          let index = 0;
          for (const [key, value] of Object.entries(oSelRow)) {
            //we start not with a | , format: <field1>|<field2>|<field3>
            if ( index === 0 ){
              returnValue = value;
            } else {
              returnValue = returnValue + "|" + value;
            }
            index = index + 1;
          }

          return returnValue;
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
                "sap/ui/model/Sorter",
            		"sap/ui/model/json/JSONModel",
            		"sap/m/MessageToast",
            		"sap/ui/core/format/DateFormat",
                "sap/m/ToolbarSpacer",
                "sap/ui/table/library",
                "sap/ui/thirdparty/jquery"
             ], function(Log, Controller, Sorter, JSONModel, MessageToast, DateFormat, ToolbarSpacer, library, jQuery) {
                "use strict";

                // shortcut for sap.ui.table.SortOrder
	              var SortOrder = library.SortOrder;


                return Controller.extend("myView.Template", {
                                   onInit: function() {

                                     if (that._firstConnection === 0) {
                                         that._firstConnection = 1;
                                     } else {

                                           var oData = {
                                                    TableData : [
                                                      { Name: 'Standard CAN'  ,  ProductId : 'RB1234 ', Quantity: 1000, DeliveryDate: '18.03.2021' },
                                                      { Name: 'Hero CAN'      ,  ProductId : 'RB1235 ', Quantity: 2000, DeliveryDate: '20.12.2020' },
                                                      { Name: 'Summer Edition',  ProductId : 'RB1236 ', Quantity: 2000, DeliveryDate: '21.03.2020' }
                                                    ]
                                           };
                                           var oModel = new JSONModel(oData);
                                           this.getView().setModel(oModel);

                                           //this.jModel = new sap.ui.model.json.JSONModel();
                                           //this.jModel.setData(this._data);
                                      }

                                   },

                                   onBeforeRendering: function() {
                                  //   this.byId('oTable').setModel(this.jModel);
                                     window.globVar_UI5_Table = this.byId('oTable');
                                   },

                                   sortProductId: function(oEvent) {
                                    // let oTable = window.globVar_UI5_Table;
                                    // let oView = this.byId('myView.Template');
                                    // let oProdIdCol = oView.byId("ProductId");
                                    // oTable.sort(oProdIdCol, this._bSortColumnDescending ? SortOrder.Descending : SortOrder.Ascending, /*extend existing sorting*/true)
                                    // this._bSortColumnDescending = !this._bSortColumnDescending;
                                    console.log("sortProductId called");
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
                                   },

                                   handleOpenVersionPress: function(oEvent) {
                                   			MessageToast.show("Details for product with id");
                                        let buttonContext = oEvent.getSource().getBindingContext().getObject();
                                        that.dispatchEvent(new Event("VersionOpenPressed", {
                                            detail: {
                                                object_button: buttonContext
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
                //oView.byId("passwordInput").setEnabled(false);
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
