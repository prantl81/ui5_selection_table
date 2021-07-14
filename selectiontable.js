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
              xmlns:mvc="sap.ui.core.mvc"
              xmlns="sap.ui.table"
              xmlns:c="sap.ui.core"
              xmlns:m="sap.m"
              xmlns:u="sap.ui.unified" controllerName="myView.Template" height="100%">
              <m:Page showHeader="false" enableScrolling="false" class="sapUiContentPadding">
                  <m:content>
                      <Table id="oTable" rows="{/TableData}" selectionMode="Single" selectionBehavior="RowOnly" visibleRowCount="15" sort="sortProductId" ariaLabelledBy="title">
                          <extension>
                              <m:OverflowToolbar style="Clear">
                                  <m:Title id="title" text="Table Data" />
                              </m:OverflowToolbar>
                          </extension>
                          <columns>
                              <Column sortProperty="Name" filterProperty="Name">
                                  <m:Label text="Product Name" />
                                  <template>
                                      <m:Text text="{Name}" wrapping="false" />
                                  </template>
                              </Column>
                              <Column sortProperty="ProductId" filterProperty="ProductId">
                                  <m:Label text="Product Id" />
                                  <template>
                                      <m:Label text="{ProductId}" />
                                  </template>
                              </Column>
                              <Column  sortProperty="Quantity" hAlign="End">
                                  <m:Label text="Quantity" />
                                  <template>
                                      <m:Label text="{Quantity}" />
                                  </template>
                              </Column>
                              <Column  showSortMenuEntry="false">
                                  <m:Label text="Delivery Date" />
                                  <template>
                                      <m:Label text="{DeliveryDate}" />
                                  </template>
                              </Column>
                              <Column  hAlign="Center">
                                  <m:Label text="SPL" />
                                  <template>
                                      <m:CheckBox selected="{ path: 'Heavy', type: 'sap.ui.model.type.String' }" />
                                  </template>
                              </Column>
                              <Column  showSortMenuEntry="false" hAlign="Center">
                                  <template>
                                      <m:Button type="Default" text="Open Version" press="handleOpenVersionPress" />
                                  </template>
                              </Column>
                              <Column  showSortMenuEntry="false" hAlign="Center">
                                   <template>
                                      <m:Button type="Reject" text="Delete Version" press="handleDeleteVersionPress"/>
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

            this.addEventListener("click", event => {
                 console.log('click');
                 let  oTable = window.globVar_UI5_Table
                 let oSelectionIndex =  oTable.getSelectedIndex();
                 if ( oSelectionIndex > -1 ){
             					let context = oTable.getContextByIndex(oSelectionIndex);
             					let value = context.getProperty("ProductId");

             					this.dispatchEvent(new Event("onSelectionChange", {
             						  detail: {
             								properties: {
             								  rowDetails: value
             								}
             						  }
             					}));
                 }
             });


             this.addEventListener("VersionOpenPressed", event => {
                 let detail = event.detail.buttonContext;
                 let returnValue = "";

                 //Loop Over Object to get only values into
                 let index = 0;
                 for (const [key, value] of Object.entries(detail)) {
                   //we start not with a | , format: <field1>|<field2>|<field3>
                       if ( index === 0 ){
                           returnValue = value;
                       } else {
                           returnValue = returnValue + "|" + value;
                       }
                       index = index + 1;
                 }

             //change property rowDetails
             this.dispatchEvent(new CustomEvent("propertiesChanged", {
                   detail: {
                     properties: {
                       rowDetails: returnValue
                     }
                   }
               }
             ));

             //inform the widget that the version button was pressed, in SAC we can then read the property rowDetails
             this.dispatchEvent(new Event("OpenVersionPress", { }));


         });

        this.addEventListener("VersionDeletePressed", event => {
                    let detail = event.detail.buttonContext;
                    let returnValue = "";

                    //Loop Over Object to get only values into
                    let index = 0;
                    for (const [key, value] of Object.entries(detail)) {
                      //we start not with a | , format: <field1>|<field2>|<field3>
                          if ( index === 0 ){
                              returnValue = value;
                          } else {
                              returnValue = returnValue + "|" + value;
                          }
                          index = index + 1;
                    }

                //change property rowDetails
                this.dispatchEvent(new CustomEvent("propertiesChanged", {
                      detail: {
                        properties: {
                          rowDetails: returnValue
                        }
                      }
                  }
                ));

                //inform the widget that the version button was pressed, in SAC we can then read the property rowDetails
                this.dispatchEvent(new Event("DeleteVersionPress", { }));

          });

            //empty properties
            this._props = {};

          } //constructor




          // ---------------   Standard Methods --------------------------------

          // executed Jbefore the properties of the custom widget are updated.
          onCustomWidgetBeforeUpdate(changedProperties) {
              if ("designMode" in changedProperties) {
                  this._designMode = changedProperties["designMode"];
              }
              //merged with the properties of the _props object. Thus, _props contains the state of all properties before the update
              this._props = { ...this._props, ...changedProperties };
          }



          // executed after the properties of the custom widget have been updated.
          onCustomWidgetAfterUpdate(changedProperties) {

              loadthis(this);
            
              if ("rowDetails" in changedProperties) {
                this.rowDetails = changedProperties["rowDetails"];
              }
          }



          // executed when this Web Component of the custom widget is connected to the HTML DOM of the web page.
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



          // executed when this Web Component of the custom widget is disconnected from the HTML DOM of the web page.
          disconnectedCallback() {
              if (this._subscription) {
                  this._subscription();
                  this._subscription = null;
              }
          }



          // execute JavaScript code when the custom widget is resized
          onCustomWidgetResize(width, height) {
          }



          // ---------------   Property Setter/Getter Functions

          /* not implemented that way, we use the "propertiesChanged" event to let the Custom Widget SDK framework do the job
          set rowDetails(newValue) {
              this.rowDetails = newValue;
          }


          get rowDetails() {
              return this.this.rowDetails;
          }
          */


          // ---------------   "custom" methods of the widget --------------------------------

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

          //alternativly -> get selected row
          let  oTable = window.globVar_UI5_Table

          //check if a row is selected
          let oSelectionIndex =  oTable.getSelectedIndex();
          if ( oSelectionIndex > -1 ){
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
              return "Line Deleted.";
    	      } else {
              return "NO line selected!";
            }
       }


        getSelectedRow(){
              let returnValue = "";
              let  oTable = window.globVar_UI5_Table

              //check if a row is selected
              let oSelectionIndex =  oTable.getSelectedIndex();
              if ( oSelectionIndex > -1 ){


                var oContext = oTable.getContextByIndex(oSelectionIndex);

                var sPath = oContext.getPath();
                var oSelRow = oContext.getProperty(sPath);


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
            } else {
                return "no row selected!"
            }
        }


          // ---------------   other methods of the widget --------------------------------



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
            		"sap/ui/core/mvc/Controller",   //define as we can't require the MVC controller
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
                                                      { Name: 'Summer Edition',  ProductId : 'RB1236 ', Quantity: 3000, DeliveryDate: '21.03.2020' },
                                                      { Name: 'Winter Edition',  ProductId : 'RB1236 ', Quantity: 4000, DeliveryDate: '21.03.2020' },
                                                      { Name: 'Organics'      ,  ProductId : 'RB1236 ', Quantity:  200, DeliveryDate: '21.03.2020' },
                                                      { Name: 'Water'         ,  ProductId : 'RB1236 ', Quantity:  500, DeliveryDate: '21.03.2020' },
                                                      { Name: 'Chocolate'     ,  ProductId : 'RB1236 ', Quantity:  250, DeliveryDate: '21.03.2020' }
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
                                       this.settings.rowDetails = "";

                                       that.dispatchEvent(new CustomEvent("onStart", {
                                           detail: {
                                               settings: this.settings
                                           }
                                       }));
                                   },

                                   handleOpenVersionPress: function(oEvent) {
                                   			//MessageToast.show("Details for product with id");
                                        let buttonContext = oEvent.getSource().getBindingContext().getObject();
                                        that.dispatchEvent(new CustomEvent("VersionOpenPressed", { detail: { buttonContext } } ));
                                   },

                                   handleDeleteVersionPress: function(oEvent) {
                                   			//MessageToast.show("Details for product with id");
                                        let buttonContext = oEvent.getSource().getBindingContext().getObject();
                                        that.dispatchEvent(new CustomEvent("VersionDeletePressed", { detail: { buttonContext } } ));
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
