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
      xmlns="sap.m"
      xmlns:mvc="sap.ui.core.mvc"
      xmlns:l="sap.ui.layout"
      controllerName="myView.Template">
        <l:VerticalLayout
		class="sapUiContentPadding"
		width="100%">
		
              <l:content>
	<TreeTable
                    id="TreeTableBasic"
                    rows="{path:'/catalog/clothing', parameters: {arrayNames:['categories']}}"
                    selectionMode="MultiToggle"
                    enableSelectAll="false"
                    ariaLabelledBy="title">
                <extension>
                    <m:OverflowToolbar style="Clear">
                        <m:Title id="title" text="Clothing"/>
                        <m:ToolbarSpacer/>
                        <m:Button text="Collapse all" press="onCollapseAll"/>
                        <m:Button text="Collapse selection" press="onCollapseSelection"/>
                        <m:Button text="Expand first level" press="onExpandFirstLevel"/>
                        <m:Button text="Expand selection" press="onExpandSelection"/>
                    </m:OverflowToolbar>
                </extension>
                <columns>
                    <Column width="13rem">
                        <m:Label text="Categories"/>
                        <template>
                            <m:Text text="{name}" wrapping="false" />
                        </template>
                    </Column>
                    <Column width="9rem">
                        <m:Label text="Price"/>
                        <template>
                            <u:Currency value="{amount}" currency="{currency}"/>
                        </template>
                    </Column>
                    <Column width="11rem">
                        <m:Label text="Size"/>
                        <template>
                            <m:Select
                                    items="{path: '/sizes', templateShareable: true}"
                                    selectedKey="{size}"
                                    visible="{= !!${size}}"
                                    forceSelection="false">
                                <core:Item key="{key}" text="{value}"/>
                            </m:Select>
                        </template>
                    </Column>
                </columns>
            </TreeTable>
	  </l:VerticalLayout>
      </mvc:View>
     </script>        
    `;

    class SelectionTable extends HTMLElement {

        constructor() {
            super();

            _shadowRoot = this.attachShadow({
                mode: "open"
            });
            _shadowRoot.appendChild(tmpl.content.cloneNode(true));

            _id = createGuid();

            _shadowRoot.querySelector("#oView").id = _id + "_oView";

            //this._export_settings = {};
            //this._export_settings.password = "";

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
            /*this.password = "";
            this.dispatchEvent(new CustomEvent("propertiesChanged", {
                detail: {
                    properties: {
                        //password: this.password
                    }
                } */
            }));
        }

        // SETTINGS
       /* get password() {
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
        } */

        attributeChangedCallback(name, oldValue, newValue) {
            if (oldValue != newValue) {
                this[name] = newValue;
            }
        }

    }
    customElements.define("es-sac-selectiontable-ui5", SelectionTable);


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
	   "sap/ui/core/mvc/Controller",
	   "sap/ui/model/json/JSONModel"
	    ], 
        function(Controller, JSONModel) {
	"use strict";

	return Controller.extend("sap.ui.table.sample.TreeTable.JSONTreeBinding.Controller", {
		onInit: function() {
			var oModel = new JSONModel("https://prantl81.github.io/ui5_selection_table/Clothing.json");
			this.getView().setModel(oModel);
		},

		onCollapseAll: function() {
			var oTreeTable = this.byId("TreeTableBasic");
			oTreeTable.collapseAll();
		},

		onCollapseSelection: function() {
			var oTreeTable = this.byId("TreeTableBasic");
			oTreeTable.collapse(oTreeTable.getSelectedIndices());
		},

		onExpandFirstLevel: function() {
			var oTreeTable = this.byId("TreeTableBasic");
			oTreeTable.expandToLevel(1);
		},

		onExpandSelection: function() {
			var oTreeTable = this.byId("TreeTableBasic");
			oTreeTable.expand(oTreeTable.getSelectedIndices());
		}
	});
});

            //### THE APP: place the XMLView somewhere into DOM ###
            var oView  = sap.ui.xmlview({
                viewContent: jQuery(_shadowRoot.getElementById(_id + "_oView")).html(),
            });
            oView.placeAt(content);


            if (that_._designMode) {
                oView.byId("TreeTableBasic").setEnabled(false);
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
